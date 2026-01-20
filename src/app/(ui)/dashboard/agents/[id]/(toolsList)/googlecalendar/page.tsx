// app/(ui)/dashboard/agents/[id]/googlecalendar/page.tsx
"use client";

import { useMemo, useState, useEffect, use } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Link as LinkIcon, Check, ChevronsUpDown, Search } from "lucide-react";

import {
    useConnections,
    useDeleteConnection,
    useUpdateConnection,
} from "@/app/features/calendar-connection";

import {
    useInfiniteAppointmentLeadItems,
    useCreateAppointmentLeadItem,
    useUpdateAppointmentLeadItem,
    useDeleteAppointmentLeadItem,
    useAppointmentLeadItem,
} from "@/app/features/appointment-lead-item";
import type { AppointmentLeadItem } from "@/app/features/appointment-lead-item";

import {
    // booking features
    useBookingSettings,
    useUpsertBookingSettings,
    useDeleteBookingSettings,
    useAvailability,
    useUpsertAvailability,

    useAssignedCalendar,
    useAssignCalendar,
    useUnassignCalendar,
    DayOfWeekEnum,
    type DayOfWeek,
} from "@/app/features/booking";

import { getGoogleAuthUrlMutation } from "@/app/features/google-auth-calendar-connection/query";
import { useApiToken } from "@/lib/api-token-provider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* =========================================================
   IANA timezones: full list via Intl.supportedValuesOf('timeZone')
   ========================================================= */

const getAllTimeZones = (): string[] =>
    typeof Intl.supportedValuesOf === "function"

        ? (Intl.supportedValuesOf("timeZone") as string[])
        : [
            "UTC",
            "Europe/Rome",
            "Europe/London",
            "Europe/Paris",
            "Europe/Berlin",
            "Europe/Madrid",
            "Europe/Warsaw",
            "Europe/Athens",
            "Europe/Kyiv",
            "Africa/Cairo",
            "Asia/Dubai",
            "Asia/Kolkata",
            "Asia/Singapore",
            "Asia/Shanghai",
            "Asia/Tokyo",
            "Australia/Sydney",
            "Pacific/Auckland",
            "America/New_York",
            "America/Chicago",
            "America/Denver",
            "America/Los_Angeles",
            "America/Sao_Paulo",
        ];

export default function GoogleCalendarPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: agentId } = use(params);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const {
        data: connData,
        isLoading: connLoading,
        isError: connIsError,
        error: connError,
    } = useConnections(page, pageSize);

    return (
        <div className="h-full overflow-auto bg-slate-200 dark:bg-[#0a0f1a] transition-colors duration-300 relative">
            {/* Background Decoration - Centered Circle */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
                    {/* Calendar Connections - Spans 2 columns on large screens */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0d1424]/80 backdrop-blur-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Calendar Connections</h2>
                            <ConnectWithGoogleButton agentId={agentId} />
                        </div>

                        <div className="p-6">
                            {connLoading && <p>Loading…</p>}
                            {connIsError && (
                                <p className="text-red-600">
                                    Error: {(connError as any)?.details?.message || (connError as any)?.message}
                                </p>
                            )}

                            {!connLoading && connData && (
                                <>
                                    {connData.items.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No connections found.</p>
                                    ) : (
                                        <ConnectionsTable agentId={agentId} items={connData.items} />
                                    )}

                                    <div className="mt-4 flex items-center justify-between">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                        >
                                            Prev
                                        </Button>
                                        <div className="text-xs text-muted-foreground">
                                            Page {connData.page} / {connData.totalPages} — {connData.total} total
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setPage((p) => (connData && p < connData.totalPages ? p + 1 : p))
                                            }
                                            disabled={!connData || page >= connData.totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Booking Settings - Single column, spans 2 rows on large screens */}
                    <div className="lg:row-span-2">
                        <BookingSettingsSection agentId={agentId} />
                    </div>

                    {/* Weekly Availability - Spans 2 columns on large screens */}
                    <div className="lg:col-span-2">
                        <WeeklyAvailabilitySection agentId={agentId} />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- Assigned Calendar ---------- */
function AssignedCalendarSection({ agentId }: { agentId: string }) {
    const getToken = useApiToken();
    const assigned = useAssignedCalendar(agentId, getToken);
    const unassign = useUnassignCalendar(agentId, getToken);

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0d1424]/80 backdrop-blur-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Assigned Calendar</h2>
            </div>
            <div className="p-6 space-y-2">
                {assigned.isLoading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
                ) : assigned.isError ? (
                    <p className="text-sm text-red-500 dark:text-red-400">{(assigned.error as any)?.message ?? "Failed to load"}</p>
                ) : !assigned.data ? (
                    <p className="text-sm text-muted-foreground">No calendar assigned to this agent.</p>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <div>
                                <span className="font-medium">calendarConnectionId:</span>{" "}
                                <span className="font-mono">{assigned.data.calendarConnectionId}</span>
                            </div>
                            <div className="text-muted-foreground">
                                assignedAt: {new Date(assigned.data.assignedAt).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <Button
                                variant="destructive"
                                onClick={() => unassign.mutate()}
                                disabled={unassign.isPending}
                            >
                                {unassign.isPending ? "Removing…" : "Unassign"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---------- Connect with Google button ---------- */
function ConnectWithGoogleButton({ agentId }: { agentId: string }) {
    const getToken = useApiToken();

    const getUrl = useMutation(
        getGoogleAuthUrlMutation({
            getToken,
            agentId,
            returnTo: typeof window !== "undefined" ? window.location.href : undefined,
        }),
    );

    const onClick = async () => {
        try {
            const { url } = await getUrl.mutateAsync();
            try {
                sessionStorage.setItem("postConnectRedirect", window.location.href);
            } catch { }
            window.location.href = url;
        } catch (e: any) {
            alert(e?.message || "Failed to start Google OAuth");
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={getUrl.isPending}
            id="connect-with-google"
            className="px-5 py-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 backdrop-blur-2xl text-emerald-700 dark:text-emerald-50 font-medium border border-emerald-400/25 hover:border-emerald-400/40 ring-1 ring-inset ring-emerald-300/10 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
        >
            {getUrl.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <LinkIcon className="h-4 w-4" />
            )}
            Add Google Calendar
        </button>
    );
}

/* ---------- Connections table + rows (adds “Assign to agent”) ---------- */
function ConnectionsTable({ agentId, items }: { agentId: string; items: any[] }) {
    const getToken = useApiToken();
    const assigned = useAssignedCalendar(agentId, getToken);

    return (
        <table className="w-full text-sm">
            <thead className="text-left">
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                    <th className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Email</th>
                    <th className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Provider</th>
                    <th className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Calendar</th>
                    <th className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Primary</th>
                    <th className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Assigned</th>
                    <th className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map((c) => (
                    <ConnectionRow
                        key={c.id}
                        conn={c}
                        agentId={agentId}
                        assignedId={assigned.data?.calendarConnectionId}
                    />
                ))}
            </tbody>
        </table>
    );
}

function ConnectionRow({
    conn,
    agentId,
    assignedId,
}: {
    conn: any;
    agentId: string;
    assignedId?: string;
}) {
    const del = useDeleteConnection();
    const makePrimary = useUpdateConnection(conn.id);

    const getToken = useApiToken();
    const assign = useAssignCalendar(agentId, getToken);
    const unassign = useUnassignCalendar(agentId, getToken);
    const isAssigned = assignedId && assignedId === conn.id;

    return (
        <tr className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <td className="p-3 text-sm text-slate-900 dark:text-white">{conn.accountEmail}</td>
            <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{conn.provider}</td>
            <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{conn.calendarId ?? "—"}</td>
            <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{conn.isPrimary ? "Yes" : "No"}</td>
            <td className="p-3 text-sm text-slate-700 dark:text-slate-300">{isAssigned ? "Yes" : "No"}</td>
            <td className="p-3 space-x-2">
                {!conn.isPrimary && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => makePrimary.mutate({ isPrimary: true })}
                        disabled={makePrimary.isPending}
                    >
                        {makePrimary.isPending ? "Saving…" : "Make primary"}
                    </Button>
                )}

                {!isAssigned ? (
                    <Button
                        size="sm"
                        onClick={() => assign.mutate(conn.id)}
                        disabled={assign.isPending}
                    >
                        {assign.isPending ? "Assigning…" : "Assign to agent"}
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => unassign.mutate()}
                        disabled={unassign.isPending}
                    >
                        {unassign.isPending ? "Removing…" : "Unassign"}
                    </Button>
                )}

                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => del.mutate(conn.id)}
                    disabled={del.isPending}
                >
                    Delete
                </Button>
            </td>
        </tr>
    );
}

/* ---------- Booking Settings (form with proper re-hydration) ---------- */
function BookingSettingsSection({ agentId }: { agentId: string }) {
    const getToken = useApiToken();
    const settings = useBookingSettings(agentId, getToken);
    const saveMut = useUpsertBookingSettings(agentId, getToken);
    const delMut = useDeleteBookingSettings(agentId, getToken);

    // local form state
    const [appointmentSlot, setSlot] = useState<number>(30);
    const [timezone, setTimezone] = useState<string>("UTC");

    // helper: apply server model into the form
    const applyFromServer = (s?: {
        appointmentSlot?: number;
        timezone?: string;
    }) => {
        if (!s) return;
        setSlot(s.appointmentSlot ?? 30);
        setTimezone(s.timezone ?? "UTC");
    };

    // ✅ repopulate when the query data object changes
    useEffect(() => {
        applyFromServer(settings.data ?? undefined);
    }, [settings.data]);

    const timezones = useMemo(() => getAllTimeZones(), []);

    const onSave = () => {
        const payload = {
            appointmentSlot,
            allowSameDayBooking: true, // defaulting to true as requested
            enableNotifications: false,
            notificationEmails: [],
            timezone,
        };

        // ✅ update the form from the mutation result, then refetch
        saveMut.mutate(payload, {
            onSuccess: (saved) => {
                applyFromServer(saved);
                settings.refetch();
            },
        });
    };

    const onDelete = () => {
        delMut.mutate(undefined, {
            onSuccess: () => {
                // reset local defaults and refetch (settings will be null)
                setSlot(30);
                setTimezone("UTC");
                settings.refetch();
            },
        });
    };

    const slots = Array.from({ length: (120 - 5) / 5 + 1 }, (_, i) => 5 + i * 5);

    return (
        <>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0d1424]/80 backdrop-blur-xl">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Booking Settings</h2>
                </div>
                <div className="p-6 space-y-4">
                    {settings.isLoading ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
                    ) : settings.isError ? (
                        <p className="text-sm text-red-500 dark:text-red-400">
                            {(settings.error as any)?.message ?? "Failed to load"}
                        </p>
                    ) : (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium">Appointment Slot (minutes)</label>
                                    <select
                                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-sm text-slate-900 dark:text-white"
                                        value={appointmentSlot}
                                        onChange={(e) => setSlot(Number(e.target.value))}
                                        disabled={saveMut.isPending}
                                    >
                                        {slots.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium">Timezone (IANA)</label>
                                    <TimezoneSelect
                                        value={timezone}
                                        onChange={(val) => setTimezone(val)}
                                        disabled={saveMut.isPending}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={onSave}
                                    disabled={saveMut.isPending}
                                    className="px-5 py-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 backdrop-blur-2xl text-emerald-700 dark:text-emerald-50 font-medium border border-emerald-400/25 hover:border-emerald-400/40 ring-1 ring-inset ring-emerald-300/10 transition-all duration-300 disabled:opacity-50"
                                >
                                    {saveMut.isPending ? "Saving…" : settings.data ? "Update Settings" : "Create Settings"}
                                </button>

                                <Button
                                    variant="destructive"
                                    onClick={onDelete}
                                    disabled={delMut.isPending}
                                >
                                    {delMut.isPending ? "Deleting…" : "Delete Settings"}
                                </Button>

                                {(saveMut.isError || delMut.isError) && (
                                    <span className="text-sm text-red-600">
                                        {(saveMut.error as any)?.message ||
                                            (delMut.error as any)?.message ||
                                            "Action failed"}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

/* ---------- Weekly Availability (replace all + deletes; slot-aware + snap) ---------- */
function WeeklyAvailabilitySection({ agentId }: { agentId: string }) {
    const getToken = useApiToken();
    const availability = useAvailability(agentId, getToken);
    const upsert = useUpsertAvailability(agentId, getToken);


    const settings = useBookingSettings(agentId, getToken);
    const slot = settings.data?.appointmentSlot ?? 5; // minutes
    const timeStep = slot * 60; // seconds

    type WindowRow = { id?: string; dayOfWeek: DayOfWeek; startTime: string; endTime: string };

    const [rows, setRows] = useState<WindowRow[]>([]);

    useEffect(() => {
        if (!availability.data) return;
        setRows(
            availability.data.map((r) => ({
                id: r.id,
                dayOfWeek: r.dayOfWeek,
                startTime: r.startTime,
                endTime: r.endTime,
            })),
        );
    }, [availability.data]);

    const addRow = () => {
        setRows((rs) => {
            const usedDays = new Set(rs.map((r) => r.dayOfWeek));
            const nextDay = days.find((d) => !usedDays.has(d)) || "MONDAY";
            return [
                ...rs,
                { dayOfWeek: nextDay, startTime: "09:00", endTime: "17:00" } as WindowRow,
            ];
        });
    };

    const updateRow = (i: number, patch: Partial<WindowRow>) =>
        setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

    const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));

    const replaceAll = () => {
        const windows = rows.map(({ dayOfWeek, startTime, endTime }) => ({
            dayOfWeek,
            startTime,
            endTime,
        }));
        upsert.mutate({ windows });
    };



    const days = DayOfWeekEnum.options;

    // Helpers: snap times to slot grid on blur (prevents 400 from backend)
    const timeToMinutes = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };
    const minutesToHHMM = (mins: number) => {
        const h = Math.floor(mins / 60)
            .toString()
            .padStart(2, "0");
        const m = (mins % 60).toString().padStart(2, "0");
        return `${h}:${m}`;
    };
    const snapToSlot = (t: string) => {
        const mins = timeToMinutes(t);
        const snapped = Math.round(mins / slot) * slot;
        const bounded = Math.max(0, Math.min(23 * 60 + 59, snapped));
        return minutesToHHMM(bounded);
    };

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1424] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Weekly Availability</h2>
            </div>
            <div className="p-6 space-y-4">

                {availability.isLoading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
                ) : availability.isError ? (
                    <p className="text-sm text-red-500 dark:text-red-400">
                        {(availability.error as any)?.message ?? "Failed to load availability"}
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left">
                                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                        <th className="p-3 w-44 text-sm font-medium text-slate-700 dark:text-slate-300">Day</th>
                                        <th className="p-3 w-40 text-sm font-medium text-slate-700 dark:text-slate-300">Start</th>
                                        <th className="p-3 w-40 text-sm font-medium text-slate-700 dark:text-slate-300">End</th>
                                        <th className="p-3 w-28 text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, i) => (
                                        <tr key={i} className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-3">
                                                <select
                                                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-sm text-slate-900 dark:text-white disabled:opacity-50"
                                                    value={r.dayOfWeek}
                                                    onChange={(e) => updateRow(i, { dayOfWeek: e.target.value as DayOfWeek })}
                                                    disabled={upsert.isPending}
                                                >
                                                    {days.map((d) => (
                                                        <option key={d} value={d} className="bg-white dark:bg-slate-900">
                                                            {d}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="time"
                                                    step={timeStep}
                                                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-sm text-slate-900 dark:text-white disabled:opacity-50"
                                                    value={r.startTime}
                                                    onChange={(e) => updateRow(i, { startTime: e.target.value })}
                                                    onBlur={(e) => updateRow(i, { startTime: snapToSlot(e.target.value) })}
                                                    disabled={upsert.isPending}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="time"
                                                    step={timeStep}
                                                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-sm text-slate-900 dark:text-white disabled:opacity-50"
                                                    value={r.endTime}
                                                    onChange={(e) => updateRow(i, { endTime: e.target.value })}
                                                    onBlur={(e) => updateRow(i, { endTime: snapToSlot(e.target.value) })}
                                                    disabled={upsert.isPending}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => removeRow(i)}
                                                    disabled={upsert.isPending}
                                                >
                                                    Remove
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={addRow} disabled={upsert.isPending || rows.length >= 7}>
                                + Add window
                            </Button>
                            <button
                                onClick={replaceAll}
                                disabled={upsert.isPending}
                                className="px-5 py-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 backdrop-blur-2xl text-emerald-700 dark:text-emerald-50 font-medium border border-emerald-400/25 hover:border-emerald-400/40 ring-1 ring-inset ring-emerald-300/10 transition-all duration-300 disabled:opacity-50"
                            >
                                {upsert.isPending ? "Saving…" : "Update"}
                            </button>
                            {upsert.isError && (
                                <span className="text-sm text-red-600">
                                    {((upsert.error as any)?.message === "Failed to fetch")
                                        ? "Network/CORS error: check backend CORS for PUT with JSON."
                                        : (upsert.error as any)?.message ?? "Save failed"}
                                </span>
                            )}
                        </div>


                    </>
                )}
            </div>
        </div>
    );
}

/* ---------- Appointment Lead Items Sidebar ---------- */
function AppointmentLeadItemsSidebar({ agentId, isOpen, onClose }: { agentId: string; isOpen: boolean; onClose: () => void }) {
    const [search, setSearch] = useState("");
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [oneId, setOneId] = useState("");

    const list = useInfiniteAppointmentLeadItems({
        agentId,
        search: search.trim() || undefined,
    });

    const createMut = useCreateAppointmentLeadItem(agentId);
    const items = useMemo(() => (list.data?.pages ?? []).flatMap((p) => p.data), [list.data]);
    const canCreate = !!name.trim();

    const one = useAppointmentLeadItem(agentId, oneId);

    /* ---------- Timezone Select Component ---------- */
    function TimezoneSelect({
        value,
        onChange,
        disabled
    }: {
        value: string;
        onChange: (val: string) => void;
        disabled?: boolean;
    }) {
        const [open, setOpen] = useState(false);
        const [search, setSearch] = useState("");
        const allTimezones = useMemo(() => getAllTimeZones(), []);

        const filtered = useMemo(() => {
            if (!search.trim()) return allTimezones;
            return allTimezones.filter(tz => tz.toLowerCase().includes(search.toLowerCase()));
        }, [allTimezones, search]);

        // Close on click outside (simple backdrop)
        useEffect(() => {
            if (open) {
                const close = () => setOpen(false);
                window.addEventListener('click', close);
                return () => window.removeEventListener('click', close);
            }
        }, [open]);

        return (
            <div className="relative" onClick={e => e.stopPropagation()}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 font-normal hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => !disabled && setOpen(!open)}
                    disabled={disabled}
                >
                    {value ? value : "Select timezone..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>

                {open && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg animate-in fade-in-0 zoom-in-95">
                        <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-slate-400"
                                placeholder="Search timezone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-1">
                            {filtered.length === 0 ? (
                                <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                    No timezone found.
                                </div>
                            ) : (
                                filtered.map((tz) => (
                                    <div
                                        key={tz}
                                        className={`
                                        relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none 
                                        hover:bg-slate-100 dark:hover:bg-slate-800
                                        ${value === tz ? "bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"}
                                    `}
                                        onClick={() => {
                                            onChange(tz);
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                    >
                                        <Check
                                            className={`mr-2 h-4 w-4 ${value === tz ? "opacity-100" : "opacity-0"}`}
                                        />
                                        {tz}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    const showOne = oneId.trim().length > 0;

    const loadAllPages = async () => {
        while (list.hasNextPage) {
            const r = await list.fetchNextPage();
            if (r.isError || !r.hasNextPage) break;
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white dark:bg-[#0d1424] z-50 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Appointment Lead Items</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-1 md:col-span-1">
                                <label className="text-xs font-medium">Name</label>
                                <Input
                                    placeholder="Item name (1–120 chars)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={createMut.isPending}
                                />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-medium">Description (optional)</label>
                                <Textarea
                                    placeholder="Up to 1000 chars"
                                    rows={2}
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    disabled={createMut.isPending}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    createMut.mutate(
                                        { name: name.trim(), description: desc.trim() || undefined },
                                        { onSuccess: () => { setName(""); setDesc(""); list.refetch(); } },
                                    )
                                }
                                disabled={!canCreate || createMut.isPending}
                                className="px-5 py-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 backdrop-blur-2xl text-emerald-700 dark:text-emerald-50 font-medium border border-emerald-400/25 hover:border-emerald-400/40 ring-1 ring-inset ring-emerald-300/10 transition-all duration-300 disabled:opacity-50"
                            >
                                {createMut.isPending ? "Creating…" : "Create item"}
                            </button>
                            {createMut.isError && (
                                <span className="text-sm text-red-600">
                                    {(createMut.error as any)?.message ?? "Create failed"}
                                </span>
                            )}
                        </div>

                        {showOne && (
                            <div className="rounded-md border p-3 text-xs">
                                {one.isLoading ? (
                                    <>Loading item…</>
                                ) : one.isError ? (
                                    <span className="text-red-600">
                                        {(one.error as any)?.message ?? "Failed to load item"}
                                    </span>
                                ) : (
                                    <pre className="whitespace-pre-wrap break-words">
                                        {JSON.stringify(one.data?.data ?? {}, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border">
                        <div className="p-4">
                            {list.isLoading ? (
                                <p>Loading…</p>
                            ) : list.isError ? (
                                <p className="text-red-600">
                                    Error: {(list.error as any)?.message ?? "Failed to load"}
                                </p>
                            ) : items.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No items found.</p>
                            ) : (
                                <>
                                    <table className="w-full text-sm">
                                        <thead className="text-left">
                                            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                                <th className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Name</th>
                                                <th className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Description</th>
                                                <th className="p-3 w-56 text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((it) => (
                                                <AppointmentRow key={it.id} item={it} />
                                            ))}
                                        </tbody>
                                    </table>

                                    {list.hasNextPage && (
                                        <div className="mt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => list.fetchNextPage()}
                                                disabled={list.isFetchingNextPage}
                                            >
                                                {list.isFetchingNextPage ? "Loading…" : "Load more"}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function AppointmentRow({ item }: { item: AppointmentLeadItem }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(item.name);
    const [desc, setDesc] = useState(item.description ?? "");

    const updateMut = useUpdateAppointmentLeadItem(item.agentId, item.id);
    const delMut = useDeleteAppointmentLeadItem(item.agentId, item.id);

    const save = () => {
        const payload: { name?: string; description?: string } = {};
        if (name.trim() !== item.name) payload.name = name.trim();
        const normDesc = desc.trim();
        if ((item.description ?? "") !== normDesc) payload.description = normDesc || undefined;

        if (Object.keys(payload).length === 0) {
            setEditing(false);
            return;
        }
        updateMut.mutate(payload, { onSuccess: () => setEditing(false) });
    };

    return (
        <tr className="border-b border-slate-200 dark:border-white/10 align-top hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <td className="p-3">
                {editing ? (
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                ) : (
                    <span className="font-medium">{item.name}</span>
                )}
            </td>
            <td className="p-2">
                {editing ? (
                    <Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
                ) : (
                    <span className="text-muted-foreground">{item.description || "—"}</span>
                )}
            </td>
            <td className="p-2 space-x-2">
                {!editing ? (
                    <>
                        <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => delMut.mutate()}
                            disabled={delMut.isPending}
                        >
                            {delMut.isPending ? "Deleting…" : "Delete"}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button size="sm" onClick={save} disabled={updateMut.isPending || !name.trim()}>
                            {updateMut.isPending ? "Saving…" : "Save"}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setEditing(false);
                                setName(item.name);
                                setDesc(item.description ?? "");
                            }}
                            disabled={updateMut.isPending}
                        >
                            Cancel
                        </Button>
                    </>
                )}
                {(updateMut.isError || delMut.isError) && (
                    <div className="mt-1 text-xs text-red-600">
                        {(updateMut.error as any)?.message ||
                            (delMut.error as any)?.message ||
                            "Action failed"}
                    </div>
                )}
            </td>
        </tr>
    );
}

/* ---------- Timezone Select Component ---------- */
function TimezoneSelect({
    value,
    onChange,
    disabled
}: {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const allTimezones = useMemo(() => getAllTimeZones(), []);

    const filtered = useMemo(() => {
        if (!search.trim()) return allTimezones;
        return allTimezones.filter(tz => tz.toLowerCase().includes(search.toLowerCase()));
    }, [allTimezones, search]);

    // Close on click outside (simple backdrop)
    useEffect(() => {
        if (open) {
            const close = () => setOpen(false);
            window.addEventListener('click', close);
            return () => window.removeEventListener('click', close);
        }
    }, [open]);

    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 font-normal hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
            >
                {value ? value : "Select timezone..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg animate-in fade-in-0 zoom-in-95">
                    <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-slate-400"
                            placeholder="Search timezone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                No timezone found.
                            </div>
                        ) : (
                            filtered.map((tz) => (
                                <div
                                    key={tz}
                                    className={`
                                        relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none 
                                        hover:bg-slate-100 dark:hover:bg-slate-800
                                        ${value === tz ? "bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"}
                                    `}
                                    onClick={() => {
                                        onChange(tz);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 ${value === tz ? "opacity-100" : "opacity-0"}`}
                                    />
                                    {tz}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}