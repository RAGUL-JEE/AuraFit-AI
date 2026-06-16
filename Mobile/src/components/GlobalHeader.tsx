import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions, 
  TouchableWithoutFeedback 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  Menu, 
  Home, 
  Dumbbell, 
  Camera, 
  Calendar, 
  TrendingUp, 
  Heart, 
  User, 
  Settings, 
  LogOut, 
  X 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface GlobalHeaderProps {
  title?: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

export default function GlobalHeader({ title, subtitle, rightContent }: GlobalHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const toggleDrawer = () => {
    if (isOpen) {
      // Close Drawer
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => setIsOpen(false));
    } else {
      // Open Drawer
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const navigateTo = (screenName: string) => {
    toggleDrawer();
    // Use a small timeout to let the drawer close smoothly before navigating
    setTimeout(() => {
      try {
        navigation.navigate(screenName);
      } catch (e) {
        console.log(`Screen ${screenName} not found`);
      }
    }, 200);
  };

  const menuItems = [
    { label: 'Home', icon: Home, screen: 'Home' },
    { label: 'Workouts', icon: Dumbbell, screen: 'Workouts' },
    { label: 'AI Detection', icon: Camera, screen: 'Detection' },
    { label: 'Favorites', icon: Heart, screen: 'Favorites' },
    { label: 'Schedule', icon: Calendar, screen: 'Schedule' },
    { label: 'Progress', icon: TrendingUp, screen: 'Progress' },
  ];

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
            <Menu color="#111" size={26} />
          </TouchableOpacity>
          
          <View>
            {title ? (
              <Text style={styles.headerTitle}>{title}</Text>
            ) : null}
            {subtitle ? (
              <Text style={styles.headerSubtitleTop}>{subtitle}</Text>
            ) : null}
          </View>
        </View>

        {rightContent && (
          <View style={styles.rightSection}>
            {rightContent}
          </View>
        )}
      </View>

      <Modal transparent visible={isOpen} animationType="none" onRequestClose={toggleDrawer}>
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={toggleDrawer}>
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
          </TouchableWithoutFeedback>

          {/* Sliding Drawer */}
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            <View style={[styles.drawerHeader, { paddingTop: insets.top + 20 }]}>
              <Text style={styles.navLabel}>NAVIGATION</Text>
            </View>

            <View style={styles.drawerContent}>
              {menuItems.map((item, index) => {
                const isActive = route.name === item.screen;
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.drawerItem, isActive && styles.drawerItemActive]} 
                    onPress={() => navigateTo(item.screen)}
                  >
                    <item.icon color={isActive ? "#fff" : "#cbd5e1"} size={20} />
                    <Text style={[styles.drawerItemText, isActive && styles.drawerItemTextActive]}>{item.label}</Text>
                    {isActive && <View style={styles.activeIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.drawerFooter}>
              <TouchableOpacity style={styles.drawerItem} onPress={() => navigateTo('Settings')}>
                <Settings color="#cbd5e1" size={20} />
                <Text style={styles.drawerItemText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.drawerItem, { marginTop: 10 }]} onPress={() => navigateTo('Login')}>
                <LogOut color="#ef4444" size={20} />
                <Text style={[styles.drawerItemText, { color: '#ef4444' }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 16,
    padding: 2, // Slight padding for touch area
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  headerSubtitleTop: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 1,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Drawer Styles
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill as object,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#1e293b', // Dark navy from the theme
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  drawerHeader: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 1.5,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
    position: 'relative',
  },
  drawerItemActive: {
    backgroundColor: '#334155',
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#cbd5e1',
    marginLeft: 16,
  },
  drawerItemTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginBottom: 20,
  },
});
