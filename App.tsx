import {
  NotoSansKR_300Light,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_600SemiBold,
  NotoSansKR_700Bold,
  NotoSansKR_800ExtraBold,
  NotoSansKR_900Black,
  useFonts,
} from '@expo-google-fonts/noto-sans-kr';
import { useMemo, useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { BottomNav } from './src/components/BottomNav';
import { discoveryRecords, sampleRecord } from './src/data/sampleRecords';
import { CreateRecordScreen } from './src/screens/CreateRecordScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MyMapScreen } from './src/screens/MyMapScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RecordDetailScreen } from './src/screens/RecordDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors } from './src/theme';
import type { OutingRecord, TabKey } from './src/types';

type ViewState =
  | { kind: 'tab'; tab: TabKey }
  | { kind: 'detail'; record: OutingRecord; returnTab: TabKey };

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSansKR_300Light,
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_600SemiBold,
    NotoSansKR_700Bold,
    NotoSansKR_800ExtraBold,
    NotoSansKR_900Black,
  });
  const [records, setRecords] = useState<OutingRecord[]>([sampleRecord]);
  const [view, setView] = useState<ViewState>({ kind: 'tab', tab: 'map' });
  const sampleImages = useMemo(() => sampleRecord.images, []);

  if (!fontsLoaded) return null;

  const activeTab = view.kind === 'tab' ? view.tab : view.returnTab;

  const changeTab = (tab: TabKey) => setView({ kind: 'tab', tab });
  const openRecord = (record: OutingRecord, returnTab: TabKey = activeTab) =>
    setView({ kind: 'detail', record, returnTab });

  const saveRecord = (record: OutingRecord) => {
    setRecords((current) => [record, ...current]);
    setView({ kind: 'detail', record, returnTab: 'profile' });
  };

  const renderTab = () => {
    if (view.kind !== 'tab') return null;

    switch (view.tab) {
      case 'home':
        return <HomeScreen records={discoveryRecords} onOpenRecord={(record) => openRecord(record, 'home')} />;
      case 'map':
        return <MyMapScreen records={records} onOpenRecord={(record) => openRecord(record, 'map')} onCreate={() => changeTab('create')} />;
      case 'create':
        return <CreateRecordScreen images={sampleImages} onCancel={() => changeTab('profile')} onSave={saveRecord} />;
      case 'settings':
        return <SettingsScreen />;
      case 'profile':
      default:
        return (
          <ProfileScreen
            records={records}
            onOpenMap={() => changeTab('map')}
            onOpenRecord={(record) => openRecord(record, 'profile')}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.paper} />
      <View style={[styles.phone, Platform.OS === 'web' && view.kind === 'detail' && { maxWidth: '100%' }]}>
        <View style={styles.content}>
          {view.kind === 'detail' ? (
            <RecordDetailScreen
              record={view.record}
              onBack={() => changeTab(view.returnTab)}
              onOpenMap={() => changeTab('map')}
            />
          ) : renderTab()}
        </View>
        {view.kind === 'tab' ? <BottomNav active={activeTab} onChange={changeTab} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#E4E2EA',
    alignItems: 'center',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
  },
});
