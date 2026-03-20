import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CalendarHeader } from '../../../src/components/calendar/CalendarHeader';
import { MonthView } from '../../../src/components/calendar/MonthView';
import { WeekView } from '../../../src/components/calendar/WeekView';
import { DayView } from '../../../src/components/calendar/DayView';
import { palette } from '../../../src/constants/colors';
import { CalendarView } from '../../../src/types';
import { useReservationStore } from '../../../src/store/reservationStore';
import { toYMD } from '../../../src/utils/dateUtils';
import { addMonths, addWeeks, addDays, subMonths, subWeeks, subDays } from 'date-fns';

export default function CalendrierScreen() {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(toYMD(new Date()));

  const { reservations, loadReservations } = useReservationStore();

  useEffect(() => {
    loadReservations();
  }, []);

  const handlePrev = () => {
    if (view === 'month') setCurrentDate((d) => subMonths(d, 1));
    else if (view === 'week') setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subDays(d, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate((d) => addMonths(d, 1));
    else if (view === 'week') setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addDays(d, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(toYMD(today));
  };

  const handleDayPress = (ymd: string) => {
    setSelectedDate(ymd);
    if (view === 'month') {
      setCurrentDate(new Date(ymd));
      setView('day');
    }
  };

  const handleEventPress = (id: string) => {
    router.push(`/(tabs)/reservations/${id}`);
  };

  return (
    <View style={styles.container}>
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          reservations={reservations}
          selectedDate={selectedDate}
          onDayPress={handleDayPress}
        />
      )}
      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          reservations={reservations}
          selectedDate={selectedDate}
          onEventPress={handleEventPress}
          onDayPress={handleDayPress}
        />
      )}
      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          reservations={reservations}
          onEventPress={handleEventPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
});
