// app/(ui)/dashboard/agents/[id]/googlecalendar/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Link as LinkIcon } from "lucide-react";

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
  useDeleteAvailability,
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

export default function GoogleCalendarPage({ params }: { params: { id: string } }) {
  const agentId = params.id;
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    data: connData,
    isLoading: connLoading,
    isError: connIsError,
    error: connError,
  } = useConnections(page, pageSize);

  return (
    <section className="space-y-10 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Google Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Agent <span className="font-mono">{agentId}</span>
        </p>
      </header>

      {/* Assigned Calendar */}
      <AssignedCalendarSection agentId={agentId} />

      {/* Calendar Connections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Calendar Connections</h2>
          <ConnectWithGoogleButton agentId={agentId} />
        </div>

        <div className="rounded-xl border">
          <div className="p-4">
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
      </div>

      {/* Booking Settings */}
      <BookingSettingsSection agentId={agentId} />

      {/* Weekly Availability */}
      <WeeklyAvailabilitySection agentId={agentId} />

      {/* Appointment Lead Items */}
      <AppointmentLeadItemsSection agentId={agentId} />
    </section>
  );
}

/* ---------- Assigned Calendar ---------- */
function AssignedCalendarSection({ agentId }: { agentId: string }) {
  const getToken = useApiToken();
  const assigned = useAssignedCalendar(agentId, getToken);
  const unassign = useUnassignCalendar(agentId, getToken);

  return (
    <div className="rounded-xl border">
      <div className="p-4 space-y-2">
        <h2 className="text-xl font-semibold">Assigned Calendar</h2>
        {assigned.isLoading ? (
          <p>Loading…</p>
        ) : assigned.isError ? (
          <p className="text-red-600">{(assigned.error as any)?.message ?? "Failed to load"}</p>
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
      } catch {}
      window.location.href = url;
    } catch (e: any) {
      alert(e?.message || "Failed to start Google OAuth");
    }
  };

  return (
    <Button onClick={onClick} disabled={getUrl.isPending} id="connect-with-google">
      {getUrl.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LinkIcon className="mr-2 h-4 w-4" />
      )}
      Add Google Calendar
    </Button>
  );
}

/* ---------- Connections table + rows (adds “Assign to agent”) ---------- */
function ConnectionsTable({ agentId, items }: { agentId: string; items: any[] }) {
  const getToken = useApiToken();
  const assigned = useAssignedCalendar(agentId, getToken);

  return (
    <table className="w-full text-sm">
      <thead className="text-left">
        <tr className="border-b bg-muted/50">
          <th className="p-2">Email</th>
          <th className="p-2">Provider</th>
          <th className="p-2">Calendar</th>
          <th className="p-2">Primary</th>
          <th className="p-2">Assigned</th>
          <th className="p-2">Actions</th>
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
  const isAssigned = assignedId && assignedId === conn.id;

  return (
    <tr className="border-b">
      <td className="p-2">{conn.accountEmail}</td>
      <td className="p-2">{conn.provider}</td>
      <td className="p-2">{conn.calendarId ?? "—"}</td>
      <td className="p-2">{conn.isPrimary ? "Yes" : "No"}</td>
      <td className="p-2">{isAssigned ? "Yes" : "No"}</td>
      <td className="p-2 space-x-2">
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
          <span className="text-xs text-muted-foreground">Currently assigned</span>
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
  const saveMut  = useUpsertBookingSettings(agentId, getToken);
  const delMut   = useDeleteBookingSettings(agentId, getToken);

  // local form state
  const [appointmentSlot, setSlot] = useState<number>(30);
  const [allowSameDayBooking, setSameDay] = useState<boolean>(true);
  const [enableNotifications, setEnableNotifications] = useState<boolean>(false);
  const [notificationEmails, setEmails] = useState<string>("");
  const [timezone, setTimezone] = useState<string>("UTC");

  // helper: apply server model into the form
  const applyFromServer = (s?: {
    appointmentSlot?: number;
    allowSameDayBooking?: boolean;
    enableNotifications?: boolean;
    notificationEmails?: string[];
    timezone?: string;
  }) => {
    if (!s) return;
    setSlot(s.appointmentSlot ?? 30);
    setSameDay(!!s.allowSameDayBooking);
    setEnableNotifications(!!s.enableNotifications);
    setEmails((s.notificationEmails ?? []).join(", "));
    setTimezone(s.timezone ?? "UTC");
  };

  // ✅ repopulate when the query data object changes
  useEffect(() => {
    applyFromServer(settings.data ?? undefined);
  }, [settings.data]);

  const timezones = useMemo(() => getAllTimeZones(), []);

  const onSave = () => {
    const emails =
      notificationEmails
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

    const payload = {
      appointmentSlot,
      allowSameDayBooking,
      enableNotifications,
      notificationEmails: emails,
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
        setSameDay(true);
        setEnableNotifications(false);
        setEmails("");
        setTimezone("UTC");
        settings.refetch();
      },
    });
  };

  const slots = Array.from({ length: (120 - 5) / 5 + 1 }, (_, i) => 5 + i * 5);

  return (
    <div className="rounded-xl border">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Booking Settings</h2>

        {settings.isLoading ? (
          <p>Loading…</p>
        ) : settings.isError ? (
          <p className="text-red-600">
            {(settings.error as any)?.message ?? "Failed to load"}
          </p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Appointment Slot (minutes)</label>
                <select
                  className="w-full rounded-md border px-2 py-2 text-sm"
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
                <select
                  className="w-full rounded-md border px-2 py-2 text-sm"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={saveMut.isPending}
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Allow Same-Day Booking</label>
                <div className="flex items-center gap-2">
                  <input
                    id="sameDay"
                    type="checkbox"
                    checked={allowSameDayBooking}
                    onChange={(e) => setSameDay(e.target.checked)}
                    className="h-4 w-4"
                    disabled={saveMut.isPending}
                  />
                  <label htmlFor="sameDay" className="text-sm">
                    Enabled
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Enable Notifications</label>
                <div className="flex items-center gap-2">
                  <input
                    id="en"
                    type="checkbox"
                    checked={enableNotifications}
                    onChange={(e) => setEnableNotifications(e.target.checked)}
                    className="h-4 w-4"
                    disabled={saveMut.isPending}
                  />
                  <label htmlFor="en" className="text-sm">
                    Enabled
                  </label>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium">Notification Emails (comma-separated)</label>
                <Input
                  placeholder="ops@company.com, pm@company.com"
                  value={notificationEmails}
                  onChange={(e) => setEmails(e.target.value)}
                  disabled={saveMut.isPending}
                />
                {enableNotifications && notificationEmails.trim().length === 0 && (
                  <div className="text-xs text-red-600">
                    Add at least one email when notifications are enabled.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={onSave} disabled={saveMut.isPending}>
                {saveMut.isPending ? "Saving…" : settings.data ? "Update Settings" : "Create Settings"}
              </Button>

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
  );
}

/* ---------- Weekly Availability (replace all + deletes; slot-aware + snap) ---------- */
function WeeklyAvailabilitySection({ agentId }: { agentId: string }) {
  const getToken = useApiToken();
  const availability = useAvailability(agentId, getToken);
  const upsert = useUpsertAvailability(agentId, getToken);
  const del = useDeleteAvailability(agentId, getToken);

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

  const addRow = () =>
    setRows((rs) => [
      ...rs,
      { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00" } as WindowRow,
    ]);

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

  const deleteAll = () => del.mutate({ mode: "all" });
  const deleteByDay = (day: DayOfWeek) => del.mutate({ mode: "byDay", dayOfWeek: day });
  const deleteByRange = (day: DayOfWeek, start: string, end: string) =>
    del.mutate({ mode: "byRange", dayOfWeek: day, startTime: start, endTime: end });

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
    <div className="rounded-xl border">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Weekly Availability</h2>

        {availability.isLoading ? (
          <p>Loading…</p>
        ) : availability.isError ? (
          <p className="text-red-600">
            {(availability.error as any)?.message ?? "Failed to load availability"}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left">
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 w-44">Day</th>
                    <th className="p-2 w-40">Start</th>
                    <th className="p-2 w-40">End</th>
                    <th className="p-2 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">
                        <select
                          className="w-full rounded-md border px-2 py-2 text-sm"
                          value={r.dayOfWeek}
                          onChange={(e) => updateRow(i, { dayOfWeek: e.target.value as DayOfWeek })}
                          disabled={upsert.isPending}
                        >
                          {days.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="time"
                          step={timeStep}
                          className="w-full rounded-md border px-2 py-2 text-sm"
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
                          className="w-full rounded-md border px-2 py-2 text-sm"
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
              <Button variant="outline" onClick={addRow} disabled={upsert.isPending}>
                + Add window
              </Button>
              <Button onClick={replaceAll} disabled={upsert.isPending}>
                {upsert.isPending ? "Saving…" : "Replace all"}
              </Button>
              {upsert.isError && (
                <span className="text-sm text-red-600">
                  {((upsert.error as any)?.message === "Failed to fetch")
                    ? "Network/CORS error: check backend CORS for PUT with JSON."
                    : (upsert.error as any)?.message ?? "Save failed"}
                </span>
              )}
            </div>

            <div className="border-t pt-3">
              <h3 className="text-sm font-medium mb-2">Bulk delete</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="destructive" onClick={deleteAll} disabled={del.isPending}>
                  {del.isPending ? "Deleting…" : "Delete all"}
                </Button>

                {days.slice(0, 7).map((d) => (
                  <Button
                    key={d}
                    variant="outline"
                    onClick={() => deleteByDay(d)}
                    disabled={del.isPending}
                  >
                    Clear {d}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => deleteByRange("TUESDAY", "09:00", "12:00")}
                  disabled={del.isPending}
                >
                  Clear Tue 09:00–12:00
                </Button>

                {del.isError && (
                  <span className="text-sm text-red-600">
                    {((del.error as any)?.message === "Failed to fetch")
                      ? "Network/CORS error: check backend CORS for DELETE with JSON body."
                      : (del.error as any)?.message ?? "Delete failed"}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Appointment Lead Items (your existing section) ---------- */
function AppointmentLeadItemsSection({ agentId }: { agentId: string }) {
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
  const showOne = oneId.trim().length > 0;

  const loadAllPages = async () => {
    while (list.hasNextPage) {
      const r = await list.fetchNextPage();
      if (r.isError || !r.hasNextPage) break;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Appointment Lead Items</h2>

      <div className="rounded-xl border p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium">Search</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="name/description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && list.refetch()}
              />
              <Button variant="outline" onClick={() => list.refetch()}>
                Search
              </Button>
              <Button
                variant="outline"
                onClick={loadAllPages}
                disabled={!list.hasNextPage || list.isFetchingNextPage}
              >
                {list.isFetchingNextPage ? "Loading…" : "Load all"}
              </Button>
            </div>
          </div>

          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-medium">Find by ID</label>
            <Input
              placeholder="Item UUID"
              value={oneId}
              onChange={(e) => setOneId(e.target.value)}
            />
          </div>
        </div>

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
          <Button
            onClick={() =>
              createMut.mutate(
                { name: name.trim(), description: desc.trim() || undefined },
                { onSuccess: () => { setName(""); setDesc(""); list.refetch(); } },
              )
            }
            disabled={!canCreate || createMut.isPending}
          >
            {createMut.isPending ? "Creating…" : "Create item"}
          </Button>
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
                  <tr className="border-b bg-muted/50">
                    <th className="p-2">Name</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 w-56">Actions</th>
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
    <tr className="border-b align-top">
      <td className="p-2">
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
