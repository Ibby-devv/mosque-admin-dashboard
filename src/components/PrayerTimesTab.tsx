import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Save, RefreshCw, Calendar, X } from 'lucide-react';
import { PrayerTimesTabProps, ScheduledIqamaChange } from '../types';
import TimeInput from './TimeInput';
import JumuahSection from './JumuahSection';
import { Theme, media } from '../constants/theme';
import { Panel, ScreenIntro, BlockLabel, PrimaryButton } from './ui/calm';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../constants/roles';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';
import { applyOffsetIqamasToPrayerTimes, calculateIqamaTime } from '../utils/prayerTimeHelpers';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

type EffectMode = 'now' | 'onDate';

type ScheduleDraft = {
  date: string;
  time: string;
};

const getTomorrowDateString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const Page = styled.div<{ $withSticky?: boolean }>`
  padding-bottom: ${(props) =>
    props.$withSticky
      ? 'calc(88px + env(safe-area-inset-bottom, 0px))'
      : Theme.spacing.xxl};

  ${media.md} {
    padding-bottom: ${Theme.spacing.xxl};
  }
`;

const StatusLine = styled.p`
  margin: 0 0 ${Theme.spacing.lg};
  font-size: 13px;
  color: ${Theme.colors.text.muted};
`;

const UpdatedBadge = styled.span<{ $tone: 'fresh' | 'stale' | 'critical' }>`
  font-weight: 600;
  color: ${(props) =>
    props.$tone === 'fresh'
      ? Theme.colors.status.successDark
      : props.$tone === 'stale'
        ? Theme.colors.status.warningDark
        : Theme.colors.status.errorDark};
`;

const UpdatedAbsolute = styled.span`
  color: ${Theme.colors.text.muted};
`;

type UpdateFreshness = {
  relative: string;
  absolute: string;
  tone: 'fresh' | 'stale' | 'critical';
};

const calendarDayKey = (date: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const getUpdateFreshness = (
  lastUpdated: unknown,
  timeZone: string
): UpdateFreshness | null => {
  if (!lastUpdated) return null;

  const timestamp = lastUpdated as { toDate?: () => Date; seconds?: number };
  const updatedAt = timestamp?.toDate
    ? timestamp.toDate()
    : typeof timestamp?.seconds === 'number'
      ? new Date(timestamp.seconds * 1000)
      : lastUpdated instanceof Date
        ? lastUpdated
        : null;

  if (!updatedAt || Number.isNaN(updatedAt.getTime())) return null;

  const updatedKey = calendarDayKey(updatedAt, timeZone);
  const todayKey = calendarDayKey(new Date(), timeZone);
  const dayDiff = Math.round(
    (Date.parse(todayKey) - Date.parse(updatedKey)) / 86_400_000
  );

  let relative: string;
  let tone: UpdateFreshness['tone'];

  if (dayDiff <= 0) {
    relative = 'Updated today';
    tone = 'fresh';
  } else if (dayDiff === 1) {
    relative = 'Updated yesterday';
    tone = 'stale';
  } else {
    relative = `Updated ${dayDiff} days ago`;
    tone = 'critical';
  }

  const absolute = updatedAt.toLocaleDateString('en-AU', {
    timeZone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return { relative, absolute, tone };
};

const WarningPanel = styled(Panel)`
  margin-bottom: ${Theme.spacing.lg};
  background: ${Theme.colors.accent.amberSoft};
  border-color: ${Theme.colors.brand.gold[400]};
`;

const WarningTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${Theme.colors.status.warningDark};
  margin-bottom: ${Theme.spacing.xs};
`;

const WarningText = styled.div`
  font-size: 13px;
  color: ${Theme.colors.text.muted};
  line-height: 1.45;
`;

const PrayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};
`;

const PrayerPanel = styled(Panel)`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.md};
`;

const PrayerHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${Theme.spacing.md};
`;

const PrayerName = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  text-transform: capitalize;
  color: ${Theme.colors.text.strong};
`;

const AdhanValue = styled.span`
  font-size: 13px;
  color: ${Theme.colors.text.muted};
  font-variant-numeric: tabular-nums;
`;

const FieldGroup = styled.div``;

const ChipRow = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
`;

const Chip = styled.button<{ $active: boolean }>`
  flex: 1;
  min-height: 40px;
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  border-radius: ${Theme.radius.pill};
  border: 1px solid
    ${(props) =>
      props.$active ? Theme.colors.brand.navy[800] : Theme.colors.border.soft};
  background: ${(props) =>
    props.$active ? Theme.colors.brand.navy[800] : Theme.colors.surface.base};
  color: ${(props) =>
    props.$active ? Theme.colors.text.inverse : Theme.colors.text.muted};
  font-family: inherit;
  font-size: ${Theme.typography.small};
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OffsetRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${Theme.spacing.sm};
`;

const OffsetInput = styled.input`
  width: 4.5rem;
  min-height: 44px;
  padding: ${Theme.spacing.md};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.md};
  font-family: inherit;
  font-size: ${Theme.typography.body};
  text-align: center;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }

  &:disabled {
    background: ${Theme.colors.surface.muted};
    color: ${Theme.colors.text.muted};
  }
`;

const OffsetHint = styled.div`
  margin-top: ${Theme.spacing.sm};
  font-size: 13px;
  color: ${Theme.colors.brand.navy[600]};
`;

const ScheduleBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.sm};
`;

const DateInput = styled.input`
  width: 100%;
  min-height: 44px;
  padding: ${Theme.spacing.md};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.md};
  font-family: inherit;
  font-size: ${Theme.typography.body};
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${Theme.colors.brand.navy[700]};
    box-shadow: 0 0 0 3px ${Theme.colors.accent.blueSoft};
  }
`;

const ScheduleHint = styled.div`
  font-size: 12px;
  color: ${Theme.colors.text.muted};
  line-height: 1.4;
`;

const SchedulePrimary = styled.button`
  width: 100%;
  min-height: 48px;
  padding: ${Theme.spacing.md};
  border: none;
  border-radius: ${Theme.radius.md};
  background: ${Theme.colors.brand.navy[800]};
  color: white;
  font-family: inherit;
  font-size: ${Theme.typography.body};
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ScheduledBox = styled.div`
  padding: ${Theme.spacing.md};
  background: ${Theme.colors.accent.amberSoft};
  border: 1px solid ${Theme.colors.brand.gold[400]};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.small};
`;

const ScheduledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${Theme.spacing.xs};
  font-weight: 600;
  color: ${Theme.colors.status.warningDark};
`;

const DeleteScheduleButton = styled.button`
  background: none;
  border: none;
  color: ${Theme.colors.status.error};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
`;

const ScheduledDetails = styled.div`
  color: ${Theme.colors.text.muted};
  line-height: 1.45;
`;

const StatusBox = styled.div<{ $success: boolean }>`
  margin-top: ${Theme.spacing.lg};
  padding: ${Theme.spacing.md};
  background: ${(props) =>
    props.$success ? Theme.colors.status.successLight : Theme.colors.status.errorLight};
  border: 1px solid
    ${(props) => (props.$success ? Theme.colors.status.success : Theme.colors.status.error)};
  border-radius: ${Theme.radius.md};
  font-size: ${Theme.typography.body};
  color: ${(props) =>
    props.$success ? Theme.colors.status.successDark : Theme.colors.status.errorDark};
  text-align: center;
`;

const StickyBar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  padding-bottom: calc(${Theme.spacing.md} + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-top: 1px solid ${Theme.colors.border.soft};
  display: flex;
  gap: ${Theme.spacing.sm};

  ${media.md} {
    position: static;
    margin-top: ${Theme.spacing.xl};
    padding: 0;
    background: transparent;
    backdrop-filter: none;
    border-top: none;
  }
`;

const StickyInner = styled.div`
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  display: flex;
  gap: ${Theme.spacing.sm};
`;

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${Theme.spacing.sm};
  flex: 1;
  min-height: 48px;
  padding: ${Theme.spacing.md} ${Theme.spacing.lg};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.lg};
  background: ${Theme.colors.surface.base};
  color: ${Theme.colors.brand.navy[800]};
  font-family: inherit;
  font-size: ${Theme.typography.body};
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${Theme.colors.surface.soft};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  span {
    display: none;

    ${media.sm} {
      display: inline;
    }
  }
`;

const SaveSlot = styled.div`
  flex: 1.4;
`;

export default function PrayerTimesTab({
  prayerTimes,
  onChange,
  onSave,
  saving,
  mosqueSettings,
  scheduledChanges: propsScheduledChanges,
  onScheduledChangesUpdate,
  jumuahTimes,
  onJumuahChange,
  onJumuahSave,
}: PrayerTimesTabProps): React.JSX.Element {
  const { hasPermission } = usePermissions();
  const canViewPrayer = hasPermission(Permission.VIEW_PRAYER_TIMES);
  const canEdit = hasPermission(Permission.EDIT_PRAYER_TIMES);

  const prayers: string[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const [fetchingPrayerTimes, setFetchingPrayerTimes] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const initialSnapshotRef = useRef<string>(JSON.stringify(prayerTimes));

  const scheduledChanges = propsScheduledChanges || {};
  const [effectModes, setEffectModes] = useState<Record<string, EffectMode>>({});
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<string, ScheduleDraft>>({});
  const [schedulingPrayer, setSchedulingPrayer] = useState<string | null>(null);

  useEffect(() => {
    initialSnapshotRef.current = JSON.stringify(prayerTimes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!saving) {
      initialSnapshotRef.current = JSON.stringify(prayerTimes);
    }
  }, [saving, prayerTimes]);

  const getEffectMode = (prayer: string): EffectMode => effectModes[prayer] ?? 'onDate';

  const getSnapshotIqama = (prayer: string): string => {
    try {
      const snapshot = JSON.parse(initialSnapshotRef.current) as Record<string, unknown>;
      const value = snapshot[`${prayer}_iqama`];
      return typeof value === 'string' ? value : '';
    } catch {
      return '';
    }
  };

  const loadScheduledChanges = async () => {
    try {
      const getScheduledIqamaChanges = httpsCallable(functions, 'getScheduledIqamaChanges');
      const result = await getScheduledIqamaChanges({ includeApplied: false });
      const data = result.data as { success: boolean; schedules: ScheduledIqamaChange[] };

      if (data.success && data.schedules) {
        const changesMap: Record<string, ScheduledIqamaChange> = {};
        data.schedules.forEach((schedule) => {
          changesMap[schedule.prayer] = schedule;
        });
        if (onScheduledChangesUpdate) {
          onScheduledChangesUpdate(changesMap);
        }
      }
    } catch (error) {
      console.error('Error loading scheduled changes:', error);
    }
  };

  const clearScheduleDraft = (prayer: string) => {
    setScheduleDrafts((prev) => {
      if (!prev[prayer]) return prev;
      const next = { ...prev };
      delete next[prayer];
      return next;
    });
  };

  const handleEffectModeChange = (prayer: string, mode: EffectMode) => {
    if (mode === 'now') {
      const draft = scheduleDrafts[prayer];
      if (draft?.time) {
        onChange({
          ...prayerTimes,
          [`${prayer}_iqama`]: draft.time,
        } as any);
      }
      clearScheduleDraft(prayer);
      setEffectModes((prev) => ({ ...prev, [prayer]: 'now' }));
      return;
    }

    const savedIqama = getSnapshotIqama(prayer);
    const liveIqama = (prayerTimes as any)[`${prayer}_iqama`] || '';
    if (liveIqama !== savedIqama) {
      onChange({
        ...prayerTimes,
        [`${prayer}_iqama`]: savedIqama,
      } as any);
    }

    setScheduleDrafts((prev) => ({
      ...prev,
      [prayer]: {
        date: prev[prayer]?.date || getTomorrowDateString(),
        time: savedIqama || liveIqama,
      },
    }));
    setEffectModes((prev) => ({ ...prev, [prayer]: 'onDate' }));
  };

  const handleFixedIqamaChange = (prayer: string, value: string) => {
    // Existing scheduled change: edits apply to live iqama only (Save).
    if (getEffectMode(prayer) === 'onDate' && !scheduledChanges[prayer]) {
      setScheduleDrafts((prev) => ({
        ...prev,
        [prayer]: {
          date: prev[prayer]?.date || getTomorrowDateString(),
          time: value,
        },
      }));
      return;
    }

    onChange({
      ...prayerTimes,
      [`${prayer}_iqama`]: value,
    } as any);
  };

  const handleScheduleDateChange = (prayer: string, date: string) => {
    const liveIqama = (prayerTimes as any)[`${prayer}_iqama`] || '';
    setScheduleDrafts((prev) => ({
      ...prev,
      [prayer]: {
        date,
        time: prev[prayer]?.time || liveIqama,
      },
    }));
  };

  const handleSaveSchedule = async (prayer: string) => {
    const liveIqama = (prayerTimes as any)[`${prayer}_iqama`] || '';
    const draft = scheduleDrafts[prayer];
    const scheduleTime = draft?.time || liveIqama;
    const scheduleDate = draft?.date || getTomorrowDateString();

    if (!scheduleTime || !scheduleDate) return;

    setSchedulingPrayer(prayer);
    try {
      const createScheduledIqamaChange = httpsCallable(functions, 'createScheduledIqamaChange');
      const result = await createScheduledIqamaChange({
        prayer,
        effectiveDate: scheduleDate,
        iqama_time: scheduleTime,
      });

      const data = result.data as { success: boolean; id: string; message: string };

      if (data.success) {
        setFetchStatus({ success: true, message: data.message });
        await loadScheduledChanges();
        clearScheduleDraft(prayer);
      }
    } catch (error: any) {
      console.error('Error scheduling change:', error);
      setFetchStatus({
        success: false,
        message: error.message || 'Failed to schedule change',
      });
    } finally {
      setSchedulingPrayer(null);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this scheduled change?')) {
      return;
    }

    try {
      const deleteScheduledIqamaChange = httpsCallable(functions, 'deleteScheduledIqamaChange');
      const result = await deleteScheduledIqamaChange({ id: scheduleId });
      const data = result.data as { success: boolean; message: string };

      if (data.success) {
        setFetchStatus({ success: true, message: 'Scheduled change deleted' });
        await loadScheduledChanges();
      }
    } catch (error: any) {
      console.error('Error deleting scheduled change:', error);
      setFetchStatus({
        success: false,
        message: error.message || 'Failed to delete scheduled change',
      });
    }
  };

  const isDirty = JSON.stringify(prayerTimes) !== initialSnapshotRef.current;

  const handleSave = async () => {
    try {
      const maybePromise: any = (onSave as any)();
      if (maybePromise && typeof maybePromise.then === 'function') {
        await maybePromise;
      }
      initialSnapshotRef.current = JSON.stringify(prayerTimes);
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handleIqamaTypeChange = (prayer: string, type: 'fixed' | 'offset'): void => {
    const updates: any = {
      ...prayerTimes,
      [`${prayer}_iqama_type`]: type,
    };

    if (type === 'offset') {
      clearScheduleDraft(prayer);
      setEffectModes((prev) => {
        if (!prev[prayer]) return prev;
        const next = { ...prev };
        delete next[prayer];
        return next;
      });

      const existingOffset = prayerTimes[`${prayer}_iqama_offset` as keyof typeof prayerTimes];
      const offset =
        typeof existingOffset === 'number'
          ? existingOffset
          : prayer === 'maghrib'
            ? 5
            : 15;
      updates[`${prayer}_iqama_offset`] = offset;

      const adhanTime = prayerTimes[`${prayer}_adhan` as keyof typeof prayerTimes] as
        | string
        | undefined;
      const computedIqama = calculateIqamaTime(adhanTime, offset);
      if (computedIqama !== '--:--') {
        updates[`${prayer}_iqama`] = computedIqama;
      }
    }

    onChange(updates);
  };

  const handleOffsetChange = (prayer: string, value: string): void => {
    const offset = parseInt(value, 10);
    const safeOffset = Number.isFinite(offset) ? offset : 0;
    const adhanTime = prayerTimes[`${prayer}_adhan` as keyof typeof prayerTimes] as
      | string
      | undefined;
    const computedIqama = calculateIqamaTime(adhanTime, safeOffset);

    const updates: any = {
      ...prayerTimes,
      [`${prayer}_iqama_offset`]: safeOffset,
    };

    if (computedIqama !== '--:--') {
      updates[`${prayer}_iqama`] = computedIqama;
    }

    onChange(updates);
  };

  const fetchAllPrayerTimes = async (): Promise<void> => {
    if (!mosqueSettings?.latitude || !mosqueSettings?.longitude) {
      setFetchStatus({
        success: false,
        message: 'Please set mosque location in Settings first',
      });
      return;
    }

    setFetchingPrayerTimes(true);
    setFetchStatus(null);

    try {
      const coordinates = new Coordinates(mosqueSettings.latitude, mosqueSettings.longitude);
      const methodName = mosqueSettings.calculation_method || 'MuslimWorldLeague';
      const params = CalculationMethod[methodName as keyof typeof CalculationMethod]();
      const mosqueTimezone = mosqueSettings.timezone || 'Australia/Sydney';

      const now = new Date();
      const dateString = now.toLocaleDateString('en-US', { timeZone: mosqueTimezone });
      const date = new Date(dateString);

      const adhanPrayerTimes = new AdhanPrayerTimes(coordinates, date, params);

      const formatTime = (d: Date): string => {
        return d.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: mosqueTimezone,
        });
      };

      const updatedPrayerTimes = applyOffsetIqamasToPrayerTimes({
        ...prayerTimes,
        fajr_adhan: formatTime(adhanPrayerTimes.fajr),
        dhuhr_adhan: formatTime(adhanPrayerTimes.dhuhr),
        asr_adhan: formatTime(adhanPrayerTimes.asr),
        maghrib_adhan: formatTime(adhanPrayerTimes.maghrib),
        isha_adhan: formatTime(adhanPrayerTimes.isha),
      });

      onChange(updatedPrayerTimes);

      setFetchStatus({
        success: true,
        message: 'Prayer times calculated. Tap Save to keep changes.',
      });
    } catch (error: any) {
      console.error('Error calculating prayer times:', error);
      setFetchStatus({
        success: false,
        message: 'Failed to calculate prayer times. Please check mosque settings.',
      });
    } finally {
      setFetchingPrayerTimes(false);
    }
  };

  const hasLocationSettings = mosqueSettings?.latitude && mosqueSettings?.longitude;
  const mosqueTimezone = mosqueSettings?.timezone || 'Australia/Sydney';
  const updateFreshness = getUpdateFreshness(prayerTimes?.last_updated, mosqueTimezone);

  const tomorrowMin = getTomorrowDateString();

  return (
    <Page $withSticky={canViewPrayer && canEdit}>
      <ScreenIntro
        title="Prayer Times"
        subtitle="Adhan is calculated from location. You set iqama for each prayer."
      />

      {canViewPrayer && (
        <>
          {hasLocationSettings ? (
            <StatusLine>
              Adhan auto-calculated
              {updateFreshness && (
                <>
                  {' · '}
                  <UpdatedBadge $tone={updateFreshness.tone}>
                    {updateFreshness.relative}
                  </UpdatedBadge>
                  {' · '}
                  <UpdatedAbsolute>{updateFreshness.absolute}</UpdatedAbsolute>
                </>
              )}
            </StatusLine>
          ) : (
            <WarningPanel $compact>
              <WarningTitle>Location not set</WarningTitle>
              <WarningText>
                Configure mosque location in Settings to enable automatic adhan calculation.
              </WarningText>
            </WarningPanel>
          )}

          <BlockLabel>Daily</BlockLabel>
          <PrayerList>
            {prayers.map((prayer) => {
              const iqamaType = (prayerTimes as any)[`${prayer}_iqama_type`] || 'fixed';
              const iqamaOffset =
                (prayerTimes as any)[`${prayer}_iqama_offset`] ||
                (prayer === 'maghrib' ? 5 : 15);
              const adhanTime = (prayerTimes as any)[`${prayer}_adhan`];
              const calculatedIqama = calculateIqamaTime(adhanTime, iqamaOffset);
              const scheduledChange = scheduledChanges[prayer];
              const effectMode = getEffectMode(prayer);
              const liveIqama = (prayerTimes as any)[`${prayer}_iqama`] || '';
              const draft = scheduleDrafts[prayer];
              const displayIqama =
                iqamaType === 'fixed' &&
                effectMode === 'onDate' &&
                draft &&
                !scheduledChange
                  ? draft.time
                  : liveIqama;
              const scheduleDate = draft?.date || tomorrowMin;
              const scheduleTime = draft?.time || liveIqama;
              const isSchedulingThis = schedulingPrayer === prayer;
              const canSubmitSchedule =
                Boolean(scheduleDate && scheduleTime) && scheduleTime !== getSnapshotIqama(prayer);

              return (
                <PrayerPanel key={prayer} $compact>
                  <PrayerHeader>
                    <PrayerName>{prayer}</PrayerName>
                    <AdhanValue>Adhan {adhanTime || '—'}</AdhanValue>
                  </PrayerHeader>

                  <FieldGroup>
                    <BlockLabel style={{ marginBottom: Theme.spacing.sm }}>Iqama</BlockLabel>
                    <ChipRow>
                      <Chip
                        type="button"
                        $active={iqamaType === 'fixed'}
                        onClick={() => handleIqamaTypeChange(prayer, 'fixed')}
                        disabled={!canEdit}
                      >
                        Fixed
                      </Chip>
                      <Chip
                        type="button"
                        $active={iqamaType === 'offset'}
                        onClick={() => handleIqamaTypeChange(prayer, 'offset')}
                        disabled={!canEdit}
                      >
                        Offset
                      </Chip>
                    </ChipRow>
                  </FieldGroup>

                  {iqamaType === 'fixed' ? (
                    <TimeInput
                      value={displayIqama}
                      onChange={(value) => handleFixedIqamaChange(prayer, value)}
                      placeholder="Select time"
                      disabled={!canEdit}
                    />
                  ) : (
                    <div>
                      <OffsetRow>
                        <OffsetInput
                          type="number"
                          min="0"
                          max="120"
                          value={iqamaOffset}
                          onChange={(e) => handleOffsetChange(prayer, e.target.value)}
                          disabled={!canEdit}
                        />
                        <span style={{ fontSize: 14, color: Theme.colors.text.muted }}>
                          minutes after adhan
                        </span>
                      </OffsetRow>
                      {adhanTime && (
                        <OffsetHint>Iqama at {calculatedIqama}</OffsetHint>
                      )}
                    </div>
                  )}

                  {canEdit && iqamaType === 'fixed' && (
                    <FieldGroup>
                      <BlockLabel style={{ marginBottom: Theme.spacing.sm }}>
                        Takes effect
                      </BlockLabel>
                      <ChipRow>
                        <Chip
                          type="button"
                          $active={effectMode === 'now'}
                          onClick={() => handleEffectModeChange(prayer, 'now')}
                        >
                          Now
                        </Chip>
                        <Chip
                          type="button"
                          $active={effectMode === 'onDate'}
                          onClick={() => handleEffectModeChange(prayer, 'onDate')}
                          disabled={Boolean(scheduledChange)}
                        >
                          On date
                        </Chip>
                      </ChipRow>

                      {effectMode === 'onDate' && !scheduledChange && (
                        <ScheduleBody style={{ marginTop: Theme.spacing.sm }}>
                          <BlockLabel style={{ marginBottom: 0 }}>Effective date</BlockLabel>
                          <DateInput
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => handleScheduleDateChange(prayer, e.target.value)}
                            min={tomorrowMin}
                          />
                          <ScheduleHint>
                            Updates after{' '}
                            {prayer.charAt(0).toUpperCase() + prayer.slice(1)} on
                            the day before this date.
                          </ScheduleHint>
                          <SchedulePrimary
                            type="button"
                            onClick={() => handleSaveSchedule(prayer)}
                            disabled={isSchedulingThis || !canSubmitSchedule}
                          >
                            {isSchedulingThis ? 'Scheduling…' : 'Schedule'}
                          </SchedulePrimary>
                        </ScheduleBody>
                      )}

                      {scheduledChange && (
                        <ScheduledBox style={{ marginTop: Theme.spacing.sm }}>
                          <ScheduledHeader>
                            <span>
                              <Calendar
                                size={14}
                                style={{ verticalAlign: 'middle', marginRight: 4 }}
                              />
                              Scheduled
                            </span>
                            <DeleteScheduleButton
                              type="button"
                              onClick={() => handleDeleteSchedule(scheduledChange.id)}
                              title="Delete scheduled change"
                            >
                              <X size={16} />
                            </DeleteScheduleButton>
                          </ScheduledHeader>
                          <ScheduledDetails>
                            <div>
                              Effective:{' '}
                              {new Date(
                                scheduledChange.effectiveDate as number
                              ).toLocaleDateString('en-AU')}
                            </div>
                            <div>New iqama: {scheduledChange.iqama_time}</div>
                            <div>
                              Updates after{' '}
                              {prayer.charAt(0).toUpperCase() + prayer.slice(1)} on
                              the day before.
                            </div>
                          </ScheduledDetails>
                        </ScheduledBox>
                      )}
                    </FieldGroup>
                  )}
                </PrayerPanel>
              );
            })}
          </PrayerList>

          {fetchStatus && (
            <StatusBox $success={fetchStatus.success}>{fetchStatus.message}</StatusBox>
          )}

          {canEdit && (
            <StickyBar>
              <StickyInner>
                <RefreshButton
                  type="button"
                  onClick={fetchAllPrayerTimes}
                  disabled={fetchingPrayerTimes || !hasLocationSettings}
                >
                  <RefreshCw size={18} />
                  <span>{fetchingPrayerTimes ? 'Refreshing…' : 'Refresh'}</span>
                </RefreshButton>
                <SaveSlot>
                  <PrimaryButton
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    $dirty={isDirty}
                    $fullWidth
                  >
                    <Save size={18} />
                    {saving ? 'Saving…' : 'Save'}
                  </PrimaryButton>
                </SaveSlot>
              </StickyInner>
            </StickyBar>
          )}
        </>
      )}

      <JumuahSection
        jumuahTimes={jumuahTimes}
        onChange={onJumuahChange}
        onSave={onJumuahSave}
        saving={saving}
      />
    </Page>
  );
}
