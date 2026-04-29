/**
 * SwiggyHeroBanner
 * Ported from: vinothvino42/SwiggyUI → food_groceries_availability_view.dart
 *
 * Original Flutter pattern:
 *   Row([
 *     ClipRRect(orange left strip, width:10, height:140),
 *     Flexible(Column(headline, body-text)),
 *   ])
 *   + Stack with Positioned ClipOval image overlay
 *   + Bottom darkOrange bar with 'View all' + arrow
 *
 * React Native equivalent with Dal Bhaffle branding.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SWIGGY_COLORS, SWIGGY_SPACING, SWIGGY_RADIUS } from '@/constants/swiggyTokens';

interface Props {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
}

export default function SwiggyHeroBanner({
  title = 'Dal Bhaffle',
  subtitle = 'Authentic desi taste\ndelivered hot with pure ghee',
  onPress,
}: Props) {
  return (
    <View style={styles.wrapper}>
      {/* Orange left sidebar strip — ClipRRect(topRight+bottomRight radius:8, width:10, height:140) */}
      <View style={styles.strip} />

      {/* Main hero card */}
      <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.heroCardWrap}>
        <LinearGradient
          colors={['#C8420F', '#E8791A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* 70% width text — mirrors Flutter FractionallySizedBox(widthFactor:0.7) */}
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSubtitle}>{subtitle}</Text>
          </View>

          {/* Circular overlay — mirrors Flutter Positioned(top:-10, right:-10) ClipOval */}
          <View style={styles.circleOverlay}>
            <Text style={styles.circleEmoji}>🫕</Text>
          </View>

          {/* Dark orange bottom bar — Container(height:45, color:darkOrange) */}
          <View style={styles.viewBar}>
            <Text style={styles.viewBarText}>View Menu</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: SWIGGY_SPACING.base,
    marginBottom: SWIGGY_SPACING.lg,
    gap: SWIGGY_SPACING.md,
  },
  strip: {
    width: 10,
    height: 140,
    backgroundColor: SWIGGY_COLORS.primaryLight,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    alignSelf: 'center',
  },
  heroCardWrap: {
    flex: 1,
    borderRadius: SWIGGY_RADIUS.xl,
    overflow: 'hidden',
  },
  heroCard: {
    height: 150,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    paddingBottom: 44,
  },
  heroLeft: {
    width: '70%',
    padding: SWIGGY_SPACING.base,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 17,
    fontWeight: '500',
  },
  circleOverlay: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleEmoji: {
    fontSize: 60,
    marginTop: 10,
  },
  viewBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: '#A0330A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SWIGGY_SPACING.base,
    gap: SWIGGY_SPACING.sm,
  },
  viewBarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
});
