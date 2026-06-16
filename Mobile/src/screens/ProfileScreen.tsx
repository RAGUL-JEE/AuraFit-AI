import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Award, MapPin, Calendar, Phone, Target, Flame, Dumbbell, Activity, Camera, Info } from 'lucide-react-native';
import { useUserProfile } from '../hooks/useUserProfile';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import GlobalHeader from '../components/GlobalHeader';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { profile, updateProfile } = useUserProfile();
  const { totalWorkouts, totalCalories, streak, avgAccuracy } = useWorkoutHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const activeWorkouts = totalWorkouts > 0 ? totalWorkouts : profile.stats.workoutsDone;
  const activeCalories = totalCalories > 0 ? totalCalories : profile.stats.caloriesBurned;
  const activeStreak = streak > 0 ? streak : profile.stats.dayStreak;
  const activeAccuracy = avgAccuracy > 0 ? avgAccuracy : profile.stats.avgAccuracy;

  const rankText = activeAccuracy > 90 ? 'Top 3%' : activeAccuracy > 80 ? 'Top 8%' : activeAccuracy > 70 ? 'Top 15%' : 'Top 25%';

  const handleSave = () => {
    updateProfile({
      ...formData,
      age: parseInt(formData.age as any) || profile.age,
      weight: parseFloat(formData.weight as any) || profile.weight,
      height: parseInt(formData.height as any) || profile.height,
      bodyFat: parseFloat(formData.bodyFat as any) || profile.bodyFat,
    });
    setIsEditing(false);
  };

  const heightInMeters = profile.height / 100;
  const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);

  const editingHeightInMeters = (formData.height as any) / 100;
  let editingBmi = "0.0";
  if (editingHeightInMeters > 0) {
    editingBmi = ((formData.weight as any) / (editingHeightInMeters * editingHeightInMeters)).toFixed(1);
  }

  const BiometricCard = ({ icon: Icon, label, value, unit, color, isEditMode, fieldName }: any) => (
    <View style={[styles.bioCard, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
      <View style={styles.bioCardHeader}>
        <View style={[styles.bioIconBg, { backgroundColor: `${color}1A`, borderColor: `${color}59` }]}>
          <Icon size={12} color={color} />
        </View>
        <Text style={[styles.bioCardLabel, { color }]}>{label}</Text>
      </View>
      {isEditMode ? (
        <View style={styles.bioInputRow}>
          <TextInput 
            style={styles.bioInput} 
            value={String(formData[fieldName as keyof typeof formData])} 
            onChangeText={(text) => setFormData({...formData, [fieldName]: text})}
            keyboardType="numeric"
          />
          {unit ? <Text style={styles.bioUnit}>{unit}</Text> : null}
        </View>
      ) : (
        <Text style={[styles.bioCardValue, { color }]}>
          {value}
          {unit ? <Text style={styles.bioCardValueUnit}> {unit}</Text> : null}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader title="Profile" subtitle="Manage your account and biometrics." />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.coverContainer}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop' }} style={styles.coverImage} />
          
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: isEditing ? formData.avatarUrl : profile.avatarUrl }} style={styles.avatar} />
                {isEditing && (
                  <TouchableOpacity style={styles.cameraButton}>
                    <Camera size={16} color="#0f172a" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.nameContainer}>
                {isEditing ? (
                  <>
                    <TextInput 
                      style={styles.nameInput} 
                      value={formData.fullName} 
                      onChangeText={(t) => setFormData({...formData, fullName: t})} 
                    />
                    <TextInput 
                      style={styles.usernameInput} 
                      value={formData.username} 
                      onChangeText={(t) => setFormData({...formData, username: t})} 
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.fullName}>{profile.fullName}</Text>
                    <Text style={styles.username}>{profile.username}</Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.headerActions}>
              {isEditing ? (
                <>
                  <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.actionBtn, styles.cancelBtn]}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} style={[styles.actionBtn, styles.saveBtn]}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONAL INFO</Text>
          <View style={styles.infoList}>
            {[
              { icon: Mail, value: profile.email, editValue: formData.email, field: 'email', placeholder: 'Email' },
              { icon: Phone, value: profile.phoneNumber, editValue: formData.phoneNumber, field: 'phoneNumber', placeholder: 'Phone Number' },
              { icon: MapPin, value: profile.location, editValue: formData.location, field: 'location', placeholder: 'Location' },
              { icon: Target, value: profile.fitnessGoal, editValue: formData.fitnessGoal, field: 'fitnessGoal', placeholder: 'Fitness Goal' },
            ].map((item, i) => (
              <View key={i} style={styles.infoRow}>
                <item.icon size={20} color="#64748B" />
                {isEditing ? (
                  <TextInput 
                    style={styles.infoInput} 
                    value={item.editValue} 
                    onChangeText={(t) => setFormData({...formData, [item.field]: t})} 
                    placeholder={item.placeholder}
                  />
                ) : (
                  <Text style={styles.infoText}>{item.value}</Text>
                )}
              </View>
            ))}
            <View style={styles.infoRow}>
              <Calendar size={20} color="#64748B" />
              <Text style={styles.infoText}>Joined {profile.joinedDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          <View style={styles.achievementsGrid}>
            
            <View style={styles.achievementRow}>
              <View style={[styles.achieveIconBg, { backgroundColor: 'rgba(234,88,12,0.1)', borderColor: 'rgba(234,88,12,0.35)' }]}>
                <Award size={20} color="#ea580c" />
              </View>
              <View>
                <Text style={styles.achieveLabel}>Elite Rank</Text>
                <Text style={[styles.achieveValue, { color: '#ea580c' }]}>{rankText}</Text>
              </View>
            </View>

            <View style={styles.achievementRow}>
              <View style={[styles.achieveIconBg, { backgroundColor: 'rgba(147,51,234,0.1)', borderColor: 'rgba(147,51,234,0.35)' }]}>
                <Flame size={20} color="#9333ea" />
              </View>
              <View>
                <Text style={styles.achieveLabel}>Consistency</Text>
                <Text style={[styles.achieveValue, { color: '#9333ea' }]}>{activeStreak}-Day Streak</Text>
              </View>
            </View>

            <View style={styles.achievementRow}>
              <View style={[styles.achieveIconBg, { backgroundColor: 'rgba(220,38,38,0.1)', borderColor: 'rgba(220,38,38,0.35)' }]}>
                <Flame size={20} color="#dc2626" />
              </View>
              <View>
                <Text style={styles.achieveLabel}>Calories Burned</Text>
                <Text style={[styles.achieveValue, { color: '#dc2626' }]}>{activeCalories.toLocaleString()} <Text style={{fontSize: 12}}>kcal</Text></Text>
              </View>
            </View>

            <View style={styles.achievementRow}>
              <View style={[styles.achieveIconBg, { backgroundColor: 'rgba(5,150,105,0.1)', borderColor: 'rgba(5,150,105,0.35)' }]}>
                <Target size={20} color="#059669" />
              </View>
              <View>
                <Text style={styles.achieveLabel}>Completed</Text>
                <Text style={[styles.achieveValue, { color: '#059669' }]}>{activeWorkouts} <Text style={{fontSize: 12}}>Workouts</Text></Text>
              </View>
            </View>

          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>BIOMETRICS</Text>
            <Info size={20} color="#64748B" />
          </View>
          
          <View style={styles.biometricsGrid}>
            <BiometricCard icon={Calendar} label="AGE" value={profile.age} color="#9333ea" isEditMode={isEditing} fieldName="age" />
            <BiometricCard icon={Dumbbell} label="WEIGHT" value={profile.weight} unit="kg" color="#ea580c" isEditMode={isEditing} fieldName="weight" />
            <BiometricCard icon={Activity} label="HEIGHT" value={profile.height} unit="cm" color="#2563eb" isEditMode={isEditing} fieldName="height" />
            <BiometricCard icon={Award} label="BMI" value={isEditing ? editingBmi : bmi} color="#059669" isEditMode={false} />
            <BiometricCard icon={Flame} label="BODY FAT" value={profile.bodyFat} unit="%" color="#dc2626" isEditMode={isEditing} fieldName="bodyFat" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BIO</Text>
          {isEditing ? (
            <TextInput 
              style={styles.bioTextInput} 
              multiline 
              value={formData.bio} 
              onChangeText={(t) => setFormData({...formData, bio: t})} 
            />
          ) : (
            <Text style={styles.bioText}>{profile.bio}</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  coverContainer: {
    backgroundColor: '#050505',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  coverImage: {
    width: '100%',
    height: 160,
    opacity: 0.3,
  },
  profileHeaderContent: {
    padding: 24,
    marginTop: -80,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
    gap: 16,
  },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#000',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  nameContainer: { flex: 1, paddingBottom: 8 },
  fullName: { fontSize: 28, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },
  username: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },
  nameInput: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  usernameInput: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  editBtn: { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  editBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  actionBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  saveBtn: { backgroundColor: '#fff' },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    letterSpacing: 1,
  },
  infoList: { gap: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 14, color: '#334155', fontWeight: '500', flex: 1 },
  infoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
  },
  achievementsGrid: { gap: 20 },
  achievementRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  achieveIconBg: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  achieveLabel: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  achieveValue: { fontSize: 20, fontWeight: 'bold' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12, marginBottom: 20 },
  biometricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  bioCard: {
    width: (width - 48 - 48 - 12) / 2, // (screen - container padding - internal padding - gap) / 2
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  bioIconBg: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  bioCardLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  bioCardValue: { fontSize: 24, fontWeight: 'bold' },
  bioCardValueUnit: { fontSize: 12, fontWeight: 'bold', opacity: 0.7 },
  bioInputRow: { flexDirection: 'row', alignItems: 'center' },
  bioInput: { width: 48, textAlign: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingVertical: 4, backgroundColor: '#fff', fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  bioUnit: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginLeft: 4 },
  bioText: { fontSize: 14, color: '#475569', lineHeight: 24 },
  bioTextInput: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 14, color: '#0f172a', minHeight: 120, textAlignVertical: 'top' },
});
