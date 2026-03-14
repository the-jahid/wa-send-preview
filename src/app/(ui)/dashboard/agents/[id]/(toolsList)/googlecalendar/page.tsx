// app/(ui)/dashboard/agents/[id]/googlecalendar/page.tsx
"use client";

import { useMemo, useState, useEffect, use } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Link as LinkIcon, Check, ChevronsUpDown, Search, Trash2, Calendar, Clock, Globe, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

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

const getAllTimeZones = (): string[] =>
    typeof Intl.supportedValuesOf === "function"
        ? (Intl.supportedValuesOf("timeZone") as string[])
        : [
            "UTC", "Europe/Rome", "Europe/London", "Europe/Paris", "Europe/Berlin",
            "Europe/Madrid", "Europe/Warsaw", "Europe/Athens", "Europe/Kyiv",
            "Africa/Cairo", "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore",
            "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland",
            "America/New_York", "America/Chicago", "America/Denver",
            "America/Los_Angeles", "America/Sao_Paulo",
        ];

/* ── shared input style ── */
const inputCls = "w-full h-9 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white placeholder:text-white/25 px-3 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-40";
const selectCls = "w-full h-9 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white px-3 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-40 appearance-none";

export default function GoogleCalendarPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: agentId } = use(params);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { data: connData, isLoading: connLoading, isError: connIsError, error: connError } =
        useConnections(page, pageSize);

    return (
        <div className="min-h-full bg-[#080d17] p-4 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-5">
                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Calendar Connections — 2 cols */}
                    <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-[#0d1424] overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-400/10 border border-sky-400/20 shrink-0">
                                    <Calendar className="h-3.5 w-3.5 text-sky-400" />
                                </div>
                                <h2 className="text-sm font-semibold text-white">Calendar Connections</h2>
                            </div>
                            <ConnectWithGoogleButton agentId={agentId} />
                        </div>

                        <div className="p-5">
                            {connLoading ? (
                                <div className="flex items-center gap-2 py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-white/30" />
                                    <p className="text-sm text-white/30">Loading…</p>
                                </div>
                            ) : connIsError ? (
                                <p className="text-sm text-red-400">
                                    {(connError as any)?.details?.message || (connError as any)?.message}
                                </p>
                            ) : connData && (
                                <>
                                    {connData.items.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                                <Calendar className="h-5 w-5 text-white/20" />
                                            </div>
                                            <p className="text-sm text-white/30">No connections found.</p>
                                        </div>
                                    ) : (
                                        <ConnectionsTable agentId={agentId} items={connData.items} />
                                    )}

                                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/[0.05]">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            className="h-7 px-3 rounded-lg border border-white/[0.08] text-xs text-white/40 hover:bg-white/[0.04] disabled:opacity-30 transition-colors flex items-center gap-1"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />Prev
                                        </button>
                                        <p className="text-xs text-white/30">
                                            Page <span className="text-white/60">{connData.page}</span> / <span className="text-white/60">{connData.totalPages}</span> · <span className="text-white/60">{connData.total}</span> total
                                        </p>
                                        <button
                                            onClick={() => setPage((p) => (connData && p < connData.totalPages ? p + 1 : p))}
                                            disabled={!connData || page >= connData.totalPages}
                                            className="h-7 px-3 rounded-lg border border-white/[0.08] text-xs text-white/40 hover:bg-white/[0.04] disabled:opacity-30 transition-colors flex items-center gap-1"
                                        >
                                            Next<ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Booking Settings — 1 col, spans 2 rows */}
                    <div className="lg:row-span-2">
                        <BookingSettingsSection agentId={agentId} />
                    </div>

                    {/* Weekly Availability — 2 cols */}
                    <div className="lg:col-span-2">
                        <WeeklyAvailabilitySection agentId={agentId} />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Connect with Google ── */
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
            try { sessionStorage.setItem("postConnectRedirect", window.location.href); } catch { }
            window.location.href = url;
        } catch (e: any) {
            alert(e?.message || "Failed to start Google OAuth");
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={getUrl.isPending}
            className="h-8 px-3.5 rounded-lg bg-white text-[#080d17] text-xs font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
        >
            {getUrl.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LinkIcon className="h-3.5 w-3.5" />}
            Add Google Calendar
        </button>
    );
}

/* ── Connections Table ── */
function ConnectionsTable({ agentId, items }: { agentId: string; items: any[] }) {
    const getToken = useApiToken();
    const assigned = useAssignedCalendar(agentId, getToken);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/[0.05]">
                        {["Email", "Provider", "Calendar", "Primary", "Assigned", "Actions"].map((h) => (
                            <th key={h} className="py-2 px-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider first:pl-0">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((c) => (
                        <ConnectionRow key={c.id} conn={c} agentId={agentId} assignedId={assigned.data?.calendarConnectionId} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ConnectionRow({ conn, agentId, assignedId }: { conn: any; agentId: string; assignedId?: string }) {
    const del = useDeleteConnection();
    const makePrimary = useUpdateConnection(conn.id);
    const getToken = useApiToken();
    const assign = useAssignCalendar(agentId, getToken);
    const unassign = useUnassignCalendar(agentId, getToken);
    const isAssigned = assignedId && assignedId === conn.id;

    return (
        <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
            <td className="py-3 px-3 text-xs text-white/70 first:pl-0">{conn.accountEmail}</td>
            <td className="py-3 px-3 text-xs text-white/50">{conn.provider}</td>
            <td className="py-3 px-3 text-xs text-white/50">{conn.calendarId ?? "—"}</td>
            <td className="py-3 px-3">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${conn.isPrimary ? "bg-emerald-400/8 border border-emerald-400/20 text-emerald-400" : "bg-white/[0.04] border border-white/[0.08] text-white/30"}`}>
                    {conn.isPrimary ? "Yes" : "No"}
                </span>
            </td>
            <td className="py-3 px-3">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isAssigned ? "bg-sky-400/8 border border-sky-400/20 text-sky-400" : "bg-white/[0.04] border border-white/[0.08] text-white/30"}`}>
                    {isAssigned ? "Yes" : "No"}
                </span>
            </td>
            <td className="py-3 px-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {!conn.isPrimary && (
                        <button
                            onClick={() => makePrimary.mutate({ isPrimary: true })}
                            disabled={makePrimary.isPending}
                            className="h-6 px-2.5 rounded border border-white/[0.08] bg-white/[0.03] text-[10px] font-medium text-white/50 hover:bg-white/[0.07] disabled:opacity-40 transition-colors"
                        >
                            {makePrimary.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Make primary"}
                        </button>
                    )}
                    {!isAssigned ? (
                        <button
                            onClick={() => assign.mutate(conn.id)}
                            disabled={assign.isPending}
                            className="h-6 px-2.5 rounded border border-white/[0.08] bg-white/[0.03] text-[10px] font-medium text-white/50 hover:bg-white/[0.07] disabled:opacity-40 transition-colors"
                        >
                            {assign.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Assign"}
                        </button>
                    ) : (
                        <button
                            onClick={() => unassign.mutate()}
                            disabled={unassign.isPending}
                            className="h-6 px-2.5 rounded border border-amber-400/20 bg-amber-400/8 text-[10px] font-medium text-amber-400 hover:bg-amber-400/12 disabled:opacity-40 transition-colors"
                        >
                            Unassign
                        </button>
                    )}
                    <button
                        onClick={() => del.mutate(conn.id)}
                        disabled={del.isPending}
                        className="h-6 w-6 rounded border border-red-400/20 bg-red-400/8 text-red-400 hover:bg-red-400/12 disabled:opacity-40 transition-colors flex items-center justify-center"
                    >
                        {del.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                </div>
            </td>
        </tr>
    );
}

/* ── Booking Settings ── */
function BookingSettingsSection({ agentId }: { agentId: string }) {
    const getToken = useApiToken();
    const settings = useBookingSettings(agentId, getToken);
    const saveMut = useUpsertBookingSettings(agentId, getToken);
    const delMut = useDeleteBookingSettings(agentId, getToken);

    const [appointmentSlot, setSlot] = useState<number>(30);
    const [timezone, setTimezone] = useState<string>("UTC");

    const applyFromServer = (s?: { appointmentSlot?: number; timezone?: string }) => {
        if (!s) return;
        setSlot(s.appointmentSlot ?? 30);
        setTimezone(s.timezone ?? "UTC");
    };

    useEffect(() => { applyFromServer(settings.data ?? undefined); }, [settings.data]);

    const timezones = useMemo(() => getAllTimeZones(), []);
    const slots = Array.from({ length: (120 - 5) / 5 + 1 }, (_, i) => 5 + i * 5);

    const onSave = () => {
        saveMut.mutate(
            { appointmentSlot, allowSameDayBooking: true, enableNotifications: false, notificationEmails: [], timezone },
            { onSuccess: (saved) => { applyFromServer(saved); settings.refetch(); } },
        );
    };

    const onDelete = () => {
        delMut.mutate(undefined, {
            onSuccess: () => { setSlot(30); setTimezone("UTC"); settings.refetch(); },
        });
    };

    return (
        <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-400/10 border border-violet-400/20 shrink-0">
                    <Clock className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <h2 className="text-sm font-semibold text-white">Booking Settings</h2>
            </div>

            <div className="p-5">
                {settings.isLoading ? (
                    <div className="flex items-center gap-2 py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-white/30" />
                        <p className="text-sm text-white/30">Loading…</p>
                    </div>
                ) : settings.isError ? (
                    <p className="text-sm text-red-400">{(settings.error as any)?.message ?? "Failed to load"}</p>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-white/40">Appointment Slot (minutes)</label>
                            <select
                                className={selectCls}
                                value={appointmentSlot}
                                onChange={(e) => setSlot(Number(e.target.value))}
                                disabled={saveMut.isPending}
                            >
                                {slots.map((s) => <option key={s} value={s} className="bg-[#0d1424]">{s}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-white/40 flex items-center gap-1.5">
                                <Globe className="h-3 w-3" />Timezone (IANA)
                            </label>
                            <TimezoneSelect value={timezone} onChange={setTimezone} disabled={saveMut.isPending} />
                        </div>

                        <div className="pt-1 space-y-2">
                            <button
                                onClick={onSave}
                                disabled={saveMut.isPending}
                                className="w-full h-9 rounded-lg bg-white text-[#080d17] text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                {saveMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {settings.data ? "Update Settings" : "Create Settings"}
                            </button>
                            <button
                                onClick={onDelete}
                                disabled={delMut.isPending}
                                className="w-full h-9 rounded-lg border border-red-400/20 bg-red-400/8 text-red-400 text-sm font-medium hover:bg-red-400/12 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                            >
                                {delMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                Delete Settings
                            </button>
                        </div>

                        {(saveMut.isError || delMut.isError) && (
                            <p className="text-xs text-red-400">
                                {(saveMut.error as any)?.message || (delMut.error as any)?.message || "Action failed"}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Weekly Availability ── */
function WeeklyAvailabilitySection({ agentId }: { agentId: string }) {
    const getToken = useApiToken();
    const availability = useAvailability(agentId, getToken);
    const upsert = useUpsertAvailability(agentId, getToken);
    const settings = useBookingSettings(agentId, getToken);
    const slot = settings.data?.appointmentSlot ?? 5;
    const timeStep = slot * 60;

    type WindowRow = { id?: string; dayOfWeek: DayOfWeek; startTime: string; endTime: string };
    const [rows, setRows] = useState<WindowRow[]>([]);
    const days = DayOfWeekEnum.options;

    useEffect(() => {
        if (!availability.data) return;
        setRows(availability.data.map((r) => ({ id: r.id, dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime })));
    }, [availability.data]);

    const timeToMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const minutesToHHMM = (mins: number) => {
        const h = Math.floor(mins / 60).toString().padStart(2, "0");
        const m = (mins % 60).toString().padStart(2, "0");
        return `${h}:${m}`;
    };
    const snapToSlot = (t: string) => {
        const mins = timeToMinutes(t);
        const snapped = Math.round(mins / slot) * slot;
        return minutesToHHMM(Math.max(0, Math.min(23 * 60 + 59, snapped)));
    };

    const addRow = () => {
        setRows((rs) => {
            const usedDays = new Set(rs.map((r) => r.dayOfWeek));
            const nextDay = days.find((d) => !usedDays.has(d)) || "MONDAY";
            return [...rs, { dayOfWeek: nextDay, startTime: "09:00", endTime: "17:00" } as WindowRow];
        });
    };
    const updateRow = (i: number, patch: Partial<WindowRow>) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));
    const replaceAll = () => upsert.mutate({ windows: rows.map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime })) });

    return (
        <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 border border-amber-400/20 shrink-0">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <h2 className="text-sm font-semibold text-white">Weekly Availability</h2>
                </div>
                <span className="text-xs text-white/25">{rows.length}/7 days</span>
            </div>

            <div className="p-5">
                {availability.isLoading ? (
                    <div className="flex items-center gap-2 py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-white/30" />
                        <p className="text-sm text-white/30">Loading…</p>
                    </div>
                ) : availability.isError ? (
                    <p className="text-sm text-red-400">{(availability.error as any)?.message ?? "Failed to load"}</p>
                ) : (
                    <div className="space-y-4">
                        {rows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 gap-2 rounded-lg border border-white/[0.05] border-dashed">
                                <p className="text-xs text-white/25">No availability windows yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/[0.05]">
                                            {["Day", "Start", "End", ""].map((h, i) => (
                                                <th key={i} className="pb-2 px-2 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider first:pl-0">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((r, i) => (
                                            <tr key={i} className="border-b border-white/[0.04] last:border-0">
                                                <td className="py-2 px-2 first:pl-0 w-40">
                                                    <select
                                                        className={selectCls}
                                                        value={r.dayOfWeek}
                                                        onChange={(e) => updateRow(i, { dayOfWeek: e.target.value as DayOfWeek })}
                                                        disabled={upsert.isPending}
                                                    >
                                                        {days.map((d) => <option key={d} value={d} className="bg-[#0d1424]">{d}</option>)}
                                                    </select>
                                                </td>
                                                <td className="py-2 px-2 w-36">
                                                    <input
                                                        type="time"
                                                        step={timeStep}
                                                        className={inputCls}
                                                        value={r.startTime}
                                                        onChange={(e) => updateRow(i, { startTime: e.target.value })}
                                                        onBlur={(e) => updateRow(i, { startTime: snapToSlot(e.target.value) })}
                                                        disabled={upsert.isPending}
                                                    />
                                                </td>
                                                <td className="py-2 px-2 w-36">
                                                    <input
                                                        type="time"
                                                        step={timeStep}
                                                        className={inputCls}
                                                        value={r.endTime}
                                                        onChange={(e) => updateRow(i, { endTime: e.target.value })}
                                                        onBlur={(e) => updateRow(i, { endTime: snapToSlot(e.target.value) })}
                                                        disabled={upsert.isPending}
                                                    />
                                                </td>
                                                <td className="py-2 px-2 w-10">
                                                    <button
                                                        onClick={() => removeRow(i)}
                                                        disabled={upsert.isPending}
                                                        className="h-8 w-8 rounded-lg border border-red-400/20 bg-red-400/8 text-red-400 hover:bg-red-400/12 disabled:opacity-40 transition-colors flex items-center justify-center"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                onClick={addRow}
                                disabled={upsert.isPending || rows.length >= 7}
                                className="h-8 px-3.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-white/50 hover:bg-white/[0.06] hover:text-white/70 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />Add window
                            </button>
                            <button
                                onClick={replaceAll}
                                disabled={upsert.isPending}
                                className="h-8 px-4 rounded-lg bg-white text-[#080d17] text-xs font-semibold hover:bg-white/90 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                            >
                                {upsert.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                                {upsert.isPending ? "Saving…" : "Save Availability"}
                            </button>
                            {upsert.isError && (
                                <p className="text-xs text-red-400">
                                    {((upsert.error as any)?.message === "Failed to fetch")
                                        ? "Network/CORS error"
                                        : (upsert.error as any)?.message ?? "Save failed"}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Appointment Lead Items Sidebar ── */
function AppointmentLeadItemsSidebar({ agentId, isOpen, onClose }: { agentId: string; isOpen: boolean; onClose: () => void }) {
    const [search, setSearch] = useState("");
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [oneId, setOneId] = useState("");

    const list = useInfiniteAppointmentLeadItems({ agentId, search: search.trim() || undefined });
    const createMut = useCreateAppointmentLeadItem(agentId);
    const items = useMemo(() => (list.data?.pages ?? []).flatMap((p) => p.data), [list.data]);
    const canCreate = !!name.trim();
    const one = useAppointmentLeadItem(agentId, oneId);
    const showOne = oneId.trim().length > 0;

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />}
            <div className={`fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 bg-[#080d17] border-l border-white/[0.06] z-50 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="p-5 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                        <h2 className="text-sm font-semibold text-white">Appointment Lead Items</h2>
                        <button onClick={onClose} className="h-8 w-8 rounded-lg border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.04] transition-colors">
                            <X className="h-4 w-4 text-white/40" />
                        </button>
                    </div>

                    {/* Create form */}
                    <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] p-4 space-y-3">
                        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">New Item</p>
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="md:col-span-1 space-y-1.5">
                                <label className="text-xs text-white/40">Name</label>
                                <input
                                    placeholder="Item name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={createMut.isPending}
                                    className={inputCls}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs text-white/40">Description (optional)</label>
                                <textarea
                                    placeholder="Up to 1000 chars"
                                    rows={2}
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    disabled={createMut.isPending}
                                    className="w-full rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white placeholder:text-white/25 px-3 py-2 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-40 resize-none"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => createMut.mutate(
                                { name: name.trim(), description: desc.trim() || undefined },
                                { onSuccess: () => { setName(""); setDesc(""); list.refetch(); } },
                            )}
                            disabled={!canCreate || createMut.isPending}
                            className="h-8 px-4 rounded-lg bg-white text-[#080d17] text-xs font-semibold hover:bg-white/90 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                        >
                            {createMut.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                            Create item
                        </button>
                    </div>

                    {/* List */}
                    <div className="rounded-xl border border-white/[0.06] bg-[#0d1424] overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Items</p>
                        </div>
                        <div className="p-4">
                            {list.isLoading ? (
                                <div className="flex items-center gap-2 py-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-white/30" />
                                    <p className="text-sm text-white/30">Loading…</p>
                                </div>
                            ) : list.isError ? (
                                <p className="text-sm text-red-400">{(list.error as any)?.message ?? "Failed to load"}</p>
                            ) : items.length === 0 ? (
                                <p className="text-sm text-white/30 py-4 text-center">No items found.</p>
                            ) : (
                                <div className="space-y-1">
                                    {items.map((it) => <AppointmentRow key={it.id} item={it} />)}
                                    {list.hasNextPage && (
                                        <button
                                            onClick={() => list.fetchNextPage()}
                                            disabled={list.isFetchingNextPage}
                                            className="mt-2 h-8 px-3 rounded-lg border border-white/[0.08] text-xs text-white/40 hover:bg-white/[0.04] disabled:opacity-40 transition-colors w-full"
                                        >
                                            {list.isFetchingNextPage ? "Loading…" : "Load more"}
                                        </button>
                                    )}
                                </div>
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
        if (Object.keys(payload).length === 0) { setEditing(false); return; }
        updateMut.mutate(payload, { onSuccess: () => setEditing(false) });
    };

    return (
        <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.05]">
            {editing ? (
                <div className="flex-1 space-y-2">
                    <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                    <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white px-3 py-2 focus:outline-none focus:border-white/20 resize-none" />
                    <div className="flex gap-2">
                        <button onClick={save} disabled={updateMut.isPending || !name.trim()} className="h-7 px-3 rounded-lg bg-white text-[#080d17] text-xs font-semibold hover:bg-white/90 disabled:opacity-40 transition-colors flex items-center gap-1.5">
                            {updateMut.isPending && <Loader2 className="h-3 w-3 animate-spin" />}Save
                        </button>
                        <button onClick={() => { setEditing(false); setName(item.name); setDesc(item.description ?? ""); }} disabled={updateMut.isPending} className="h-7 px-3 rounded-lg border border-white/[0.08] text-xs text-white/50 hover:bg-white/[0.04] disabled:opacity-40 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">{item.name}</p>
                        {item.description && <p className="text-xs text-white/35 mt-0.5 line-clamp-2">{item.description}</p>}
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => setEditing(true)} className="h-6 px-2.5 rounded border border-white/[0.08] text-[10px] text-white/50 hover:bg-white/[0.06] transition-colors">Edit</button>
                        <button onClick={() => delMut.mutate()} disabled={delMut.isPending} className="h-6 w-6 rounded border border-red-400/20 bg-red-400/8 text-red-400 hover:bg-red-400/12 disabled:opacity-40 transition-colors flex items-center justify-center">
                            {delMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Timezone Select ── */
function TimezoneSelect({ value, onChange, disabled }: { value: string; onChange: (val: string) => void; disabled?: boolean }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const allTimezones = useMemo(() => getAllTimeZones(), []);
    const filtered = useMemo(() => !search.trim() ? allTimezones : allTimezones.filter(tz => tz.toLowerCase().includes(search.toLowerCase())), [allTimezones, search]);

    useEffect(() => {
        if (open) {
            const close = () => setOpen(false);
            window.addEventListener("click", close);
            return () => window.removeEventListener("click", close);
        }
    }, [open]);

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className="w-full h-9 rounded-lg bg-[#080d17] border border-white/[0.08] text-sm text-white px-3 flex items-center justify-between hover:border-white/20 transition-colors disabled:opacity-40"
            >
                <span className="truncate text-left">{value || "Select timezone…"}</span>
                <ChevronsUpDown className="h-3.5 w-3.5 text-white/30 shrink-0 ml-2" />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0d1424] shadow-2xl shadow-black/40 animate-in fade-in-0 zoom-in-95">
                    <div className="flex items-center gap-2 border-b border-white/[0.06] px-3">
                        <Search className="h-3.5 w-3.5 text-white/25 shrink-0" />
                        <input
                            className="h-9 w-full bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                            placeholder="Search timezone…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[180px] overflow-y-auto p-1">
                        {filtered.length === 0 ? (
                            <p className="py-4 text-center text-xs text-white/30">No timezone found.</p>
                        ) : (
                            filtered.map((tz) => (
                                <div
                                    key={tz}
                                    className={`flex items-center gap-2 cursor-pointer rounded-lg px-2.5 py-1.5 text-sm transition-colors ${value === tz ? "bg-white/[0.08] text-white" : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"}`}
                                    onClick={() => { onChange(tz); setOpen(false); setSearch(""); }}
                                >
                                    <Check className={`h-3.5 w-3.5 shrink-0 ${value === tz ? "opacity-100 text-white" : "opacity-0"}`} />
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
