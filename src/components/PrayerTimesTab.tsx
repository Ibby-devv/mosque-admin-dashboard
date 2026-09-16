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

const ScheduleToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${Theme.spacing.xs};
  background: none;
  border: none;
  padding: 0;
  min-height: 36px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: ${Theme.colors.brand.navy[700]};
  cursor: pointer;

  &:hover {
    color: ${Theme.colors.brand.navy[800]};
  }
`;

const ScheduleBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing.sm};
  padding-top: ${Theme.spacing.sm};
  border-top: 1px solid ${Theme.colors.border.soft};
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

const ScheduleActions = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
`;

const SchedulePrimary = styled.button`
  flex: 1;
  min-height: 40px;
  padding: ${Theme.spacing.sm};
  border: none;
  border-radius: ${Theme.radius.md};
  background: ${Theme.colors.brand.navy[800]};
  color: white;
  font-family: inherit;
  font-size: ${Theme.typography.small};
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ScheduleSecondary = styled.button`
  flex: 1;
  min-height: 40px;
  padding: ${Theme.spacing.sm};
  border: 1px solid ${Theme.colors.border.soft};
  border-radius: ${Theme.radius.md};
  background: transparent;
  color: ${Theme.colors.text.muted};
  font-family: inherit;
  font-size: ${Theme.typography.small};
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${Theme.colors.surface.muted};
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
  const [schedulingPrayer, setSchedulingPrayer] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    initialSnapshotRef.current = JSON.stringify(prayerTimes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!saving) {
      initialSnapshotRef.current = JSON.stringify(prayerTimes);
    }
  }, [saving, prayerTimes]);

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

  const handleScheduleClick = (prayer: string) => {
    setSchedulingPrayer(prayer);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleCancelSchedule = () => {
    setSchedulingPrayer(null);
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleSaveSchedule = async () => {
    if (!schedulingPrayer || !scheduleDate || !scheduleTime) return;

    setIsScheduling(true);
    try {
      const createScheduledIqamaChange = httpsCallable(functions, 'createScheduledIqamaChange');
      const result = await createScheduledIqamaChange({
        prayer: schedulingPrayer,
        effectiveDate: scheduleDate,
        iqama_time: scheduleTime,
      });

      const data = result.data as { success: boolean; id: string; message: string };

      if (data.success) {
        setFetchStatus({ success: true, message: data.message });
        await loadScheduledChanges();
        setSchedulingPrayer(null);
        setScheduleDate('');
        setScheduleTime('');
      }
    } catch (error: any) {
      console.error('Error scheduling change:', error);
      setFetchStatus({
        success: false,
        message: error.message || 'Failed to schedule change',
      });
    } finally {
      setIsScheduling(false);
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

  const handleTimeChange = (prayer: string, type: 'adhan' | 'iqama', value: string): void => {
    onChange({
      ...prayerTimes,
      [`${prayer}_${type}`]: value,
    } as any);
  };

  const handleIqamaTypeChange = (prayer: string, type: 'fixed' | 'offset'): void => {
    const updates: any = {
      ...prayerTimes,
      [`${prayer}_iqama_type`]: type,
    };

    if (type === 'offset') {
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

  const lastUpdatedLabel = (() => {
    if (!prayerTimes?.last_updated) return null;
    const timestamp = prayerTimes.last_updated as any;
    const date = timestamp?.toDate
      ? timestamp.toDate()
      : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  })();

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
              {lastUpdatedLabel ? ` · Last updated ${lastUpdatedLabel}` : ''}
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
              const isSchedulingThis = schedulingPrayer === prayer;

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
                      value={(prayerTimes as any)[`${prayer}_iqama`] || ''}
                      onChange={(value) => handleTimeChange(prayer, 'iqama', value)}
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
                    <div>
                      {!scheduledChange && !isSchedulingThis && (
                        <ScheduleToggle
                          type="button"
                          onClick={() => handleScheduleClick(prayer)}
                        >
                          <Calendar size={14} />
                          Schedule…
                        </ScheduleToggle>
                      )}

                      {isSchedulingThis && (
                        <ScheduleBody>
                          <BlockLabel style={{ marginBottom: 0 }}>New iqama</BlockLabel>
                          <TimeInput
                            value={scheduleTime}
                            onChange={(value) => setScheduleTime(value)}
                          />
                          <BlockLabel style={{ marginBottom: 0, marginTop: Theme.spacing.sm }}>
                            Effective date
                          </BlockLabel>
                          <DateInput
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={(() => {
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              return tomorrow.toISOString().split('T')[0];
                            })()}
                          />
                          <ScheduleHint>
                            Applies at {prayer} time on the day before this date.
                          </ScheduleHint>
                          <ScheduleActions>
                            <SchedulePrimary
                              type="button"
                              onClick={handleSaveSchedule}
                              disabled={isScheduling || !scheduleDate || !scheduleTime}
                            >
                              {isScheduling ? 'Scheduling…' : 'Schedule'}
                            </SchedulePrimary>
                            <ScheduleSecondary type="button" onClick={handleCancelSchedule}>
                              Cancel
                            </ScheduleSecondary>
                          </ScheduleActions>
                        </ScheduleBody>
                      )}

                      {scheduledChange && (
                        <ScheduledBox>
                          <ScheduledHeader>
                            <span>
                              <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
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
                              {new Date(scheduledChange.effectiveDate as number).toLocaleDateString(
                                'en-AU'
                              )}
                            </div>
                            <div>New iqama: {scheduledChange.iqama_time}</div>
                          </ScheduledDetails>
                        </ScheduledBox>
                      )}
                    </div>
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
