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
import { useState } from 'react';
import { Platform, Pressable, Text, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { BottomNav } from './src/components/BottomNav';
import { LayoutRuntime } from './src/components/LayoutRuntime';
import { discoveryRecords, sampleRecord } from './src/data/sampleRecords';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RecordDetailScreen } from './src/screens/RecordDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { WorldScreen } from './src/screens/WorldScreen';
import { colors, dotGrid } from './src/theme';
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
  const [records] = useState<OutingRecord[]>([sampleRecord]);
  const [view, setView] = useState<ViewState>({ kind: 'tab', tab: 'map' });

  if (!fontsLoaded) return null;

  const activeTab = view.kind === 'tab' ? view.tab : view.returnTab;

  const changeTab = (tab: TabKey) => setView({ kind: 'tab', tab });
  const openRecord = (record: OutingRecord, returnTab: TabKey = activeTab) =>
    setView({ kind: 'detail', record, returnTab });

  const renderTab = () => {
    if (view.kind !== 'tab') return null;

    switch (view.tab) {
      case 'home':
        return <HomeScreen records={discoveryRecords} onOpenRecord={(record) => openRecord(record, 'home')} />;
      case 'explore':
        return <HomeScreen searchOnly records={discoveryRecords} onOpenRecord={(record) => openRecord(record, 'explore')} />;
      case 'map':
      case 'create':
        return <WorldScreen adding={view.tab === 'create'} onHome={() => changeTab('map')} records={records} onOpenRecord={(record) => openRecord(record, 'map')} />;
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
      <LayoutRuntime />
      <View testID={view.kind === 'tab' && ['map', 'create'].includes(view.tab) ? 'layout-root' : undefined} style={[styles.phone, view.kind !== 'detail' && dotGrid, Platform.OS === 'web' && view.kind === 'detail' && { maxWidth: '100%' }]}>
        <View style={styles.content}>
          {view.kind==='tab' && !['map','create'].includes(view.tab) && <Pressable accessibilityRole="button" onPress={()=>changeTab('map')} style={{padding:14}}><Text style={{color:colors.brand}}>← 내 세계</Text></Pressable>}
          {view.kind === 'detail' ? (
            <RecordDetailScreen
              record={view.record}
              onBack={() => changeTab(view.returnTab)}
              onOpenMap={() => changeTab('map')}
            />
          ) : renderTab()}
        </View>
        {view.kind === 'tab' ? (
          <View pointerEvents="box-none" style={styles.navOverlay}>
            <BottomNav active={activeTab} onChange={changeTab} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    ...dotGrid,
    alignItems: 'center',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.paper,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  navOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    elevation: 20,
  },
});
