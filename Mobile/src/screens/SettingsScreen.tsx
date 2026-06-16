import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Activity, MonitorDown, Shield } from 'lucide-react-native';
import { useUserProfile } from '../hooks/useUserProfile';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import GlobalHeader from '../components/GlobalHeader';

const EmojiStyleIcon = ({ Icon, bg, border, color }: any) => (
  <View style={[styles.iconBox, { backgroundColor: bg, borderColor: border }]}>
    <Icon size={24} color={color} />
  </View>
);

export default function SettingsScreen({ navigation }: any) {
  const { profile, updateProfile } = useUserProfile();
  const { totalWorkouts } = useWorkoutHistory();

  const userTier = useMemo(() => {
    if (totalWorkouts === 0) return 'Beginner Athlete';
    if (totalWorkouts < 5) return 'Active Athlete';
    if (totalWorkouts < 15) return 'Advanced Athlete';
    return 'Elite Tier Athlete';
  }, [totalWorkouts]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader title="Settings" subtitle="Manage your Precision Coach application preferences." />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.profileLeft}>
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              <View>
                <Text style={styles.profileName} numberOfLines={1}>{profile.fullName}</Text>
                <Text style={styles.profileTier}>{userTier}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <EmojiStyleIcon Icon={Camera} bg="rgba(255,49,49,0.07)" border="rgba(255,49,49,0.18)" color="#FF5252" />
            <View style={styles.headerTextCol}>
              <Text style={styles.cardTitle}>Hardware & AI Detection</Text>
              <Text style={styles.cardDesc}>Configure camera permissions and analysis accuracy.</Text>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Enable Camera Access</Text>
              <Text style={styles.settingDesc}>Allow the app to use your device's camera for form tracking.</Text>
            </View>
            <Switch 
              value={profile.cameraEnabled ?? true} 
              onValueChange={(val) => updateProfile({ cameraEnabled: val })} 
              trackColor={{ false: '#cbd5e1', true: '#0f172a' }} 
              thumbColor={'#fff'} 
            />
          </View>

          <View style={[styles.settingRow, styles.borderTop]}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>AI Detection Sensitivity</Text>
              <Text style={styles.settingDesc}>Adjust how strict the AI is with form corrections.</Text>
            </View>
          </View>
          
          <View style={styles.sensitivityGroup}>
            {['Low', 'Medium', 'High'].map((level) => (
              <TouchableOpacity 
                key={level} 
                style={[styles.sensiBtn, profile.aiSensitivity === level && styles.sensiBtnActive]}
                onPress={() => updateProfile({ aiSensitivity: level })}
              >
                <Text style={[styles.sensiText, profile.aiSensitivity === level && styles.sensiTextActive]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <EmojiStyleIcon Icon={Activity} bg="rgba(47,107,255,0.07)" border="rgba(47,107,255,0.18)" color="#5282FF" />
            <View style={styles.headerTextCol}>
              <Text style={styles.cardTitle}>Workout Preferences</Text>
              <Text style={styles.cardDesc}>Manage coaching feedback and routine settings.</Text>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Audio Coaching Feedback</Text>
              <Text style={styles.settingDesc}>Voice cues, count reps, and form correction announcements.</Text>
            </View>
            <Switch 
              value={profile.audioFeedback ?? true} 
              onValueChange={(val) => updateProfile({ audioFeedback: val })} 
              trackColor={{ false: '#cbd5e1', true: '#0f172a' }} 
              thumbColor={'#fff'} 
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <EmojiStyleIcon Icon={MonitorDown} bg="rgba(6,182,212,0.07)" border="rgba(6,182,212,0.18)" color="#22D3EE" />
            <View style={styles.headerTextCol}>
              <Text style={styles.cardTitle}>Display & Notifications</Text>
              <Text style={styles.cardDesc}>Appearance and communication settings.</Text>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Dark Mode (Preview)</Text>
              <Text style={styles.settingDesc}>Switch application interface to darker tones.</Text>
            </View>
            <Switch 
              value={profile.darkMode ?? false} 
              onValueChange={(val) => updateProfile({ darkMode: val })} 
              trackColor={{ false: '#cbd5e1', true: '#0f172a' }} 
              thumbColor={'#fff'} 
            />
          </View>

          <View style={[styles.settingRow, styles.borderTop]}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive reminders for scheduled workouts and milestones.</Text>
            </View>
            <Switch 
              value={profile.notifications ?? true} 
              onValueChange={(val) => updateProfile({ notifications: val })} 
              trackColor={{ false: '#cbd5e1', true: '#0f172a' }} 
              thumbColor={'#fff'} 
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <EmojiStyleIcon Icon={Shield} bg="rgba(124,59,255,0.07)" border="rgba(124,59,255,0.18)" color="#A78BFA" />
            <View style={styles.headerTextCol}>
              <Text style={styles.cardTitle}>Data & Privacy</Text>
              <Text style={styles.cardDesc}>Manage your tracking data and backups.</Text>
            </View>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Cloud Sync</Text>
              <Text style={styles.settingDesc}>Sync workout history across devices securely.</Text>
            </View>
            <Switch 
              value={profile.dataSync ?? true} 
              onValueChange={(val) => updateProfile({ dataSync: val })} 
              trackColor={{ false: '#cbd5e1', true: '#0f172a' }} 
              thumbColor={'#fff'} 
            />
          </View>

          <View style={styles.clearDataBox}>
            <TouchableOpacity style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear Workout Data</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { padding: 24, paddingBottom: 100, gap: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  profileName: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  profileTier: { fontSize: 10, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 },
  editBtn: { borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  editBtnText: { color: '#0f172a', fontWeight: 'bold', fontSize: 14 },
  cardHeader: { flexDirection: 'row', gap: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16, marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTextCol: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  borderTop: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16, marginTop: 8 },
  settingTextCol: { flex: 1, paddingRight: 16 },
  settingLabel: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  settingDesc: { fontSize: 12, color: '#64748B' },
  sensitivityGroup: { flexDirection: 'row', backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 4, marginTop: 12 },
  sensiBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  sensiBtnActive: { backgroundColor: '#0f172a' },
  sensiText: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  sensiTextActive: { color: '#fff' },
  clearDataBox: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16, marginTop: 8, alignItems: 'flex-end' },
  clearBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  clearBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
});
