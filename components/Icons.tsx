import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

export type IconType =
  | 'user'
  | 'user-check'
  | 'user-plus'
  | 'phone'
  | 'shield-check'
  | 'patient-id'
  | 'dots-vertical'
  | 'dots-horizontal'
  | 'lock'
  | 'key'
  | 'close'
  | 'back'
  | 'check'
  | 'calendar'
  | 'hospital'
  | 'security'
  | 'edit'
  | 'trash'
  | 'logout'
  | 'eye'
  | 'eye-off'
  | 'refresh'
  | 'info'
  | 'search'
  | 'document'
  | 'arrow-right'
  | 'chevron-down'
  | 'chevron-right'
  | 'users'
  | 'heart'
  | 'home'
  | 'bell'
  | 'apple'
  | 'care'
  | 'user-outline'
  | 'wallet'
  | 'wallet-outline'
  | 'food-apple'
  | 'food-apple-outline'
  | 'person-add'
  | 'usergroup-add'
  | 'qrcode'
  | 'bullhorn'
  | 'history'
  | 'location'
  | 'card'
  | 'clock'
  | 'sun'
  | 'weather-sunset'
  | 'weather-sunny'
  | 'weather-night'
  | 'moon'
  | 'star'
  | 'alert-circle'
  | 'flask'
  | 'pill'
  | 'chevron-up'
  | 'medkit'
  | 'pulse'
  | 'sparkles'
  | 'sparkles-ai'
  | 'robot'
  | 'ai'
  | 'camera'
  | 'image'
  | 'gift'
  | 'plus'
  | 'minus'
  | 'bed-pulse'
  | 'hospital-bed'
  | 'bed'
  | 'bed-outline'
  | 'mail'
  | 'email'
  | 'walk';

interface IconProps {
  name: IconType;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const AppIcon: React.FC<IconProps> = ({
  name,
  size = 18,
  color = '#1D61E7',
  style,
}) => {
  switch (name) {
    case 'walk':
    case 'bed-pulse':
    case 'hospital-bed':
    case 'bed':
    case 'bed-outline':
      return <MaterialCommunityIcons name="walk" size={size} color={color} style={style} />;
    case 'user':
    case 'user-outline':
      return <MaterialIcons name="person-outline" size={size} color={color} style={style} />;
    case 'user-check':
      return <MaterialCommunityIcons name="account-check" size={size} color={color} style={style} />;
    case 'user-plus':
    case 'person-add':
      return <Ionicons name="person-add" size={size} color={color} style={style} />;
    case 'users':
      return <MaterialCommunityIcons name="account-group" size={size} color={color} style={style} />;
    case 'phone':
      return <Ionicons name="call" size={size} color={color} style={style} />;
    case 'shield-check':
      return <MaterialCommunityIcons name="shield-check-outline" size={size} color={color} style={style} />;
    case 'patient-id':
      return <MaterialCommunityIcons name="badge-account-horizontal" size={size} color={color} style={style} />;
    case 'dots-horizontal':
      return <MaterialCommunityIcons name="dots-horizontal" size={size} color={color} style={style} />;
    case 'dots-vertical':
      return <MaterialCommunityIcons name="dots-vertical" size={size} color={color} style={style} />;
    case 'lock':
      return <MaterialCommunityIcons name="lock-outline" size={size} color={color} style={style} />;
    case 'key':
      return <MaterialCommunityIcons name="key-variant" size={size} color={color} style={style} />;
    case 'close':
      return <Ionicons name="close" size={size} color={color} style={style} />;
    case 'back':
      return <Ionicons name="arrow-back" size={size} color={color} style={style} />;
    case 'check':
      return <Ionicons name="checkmark-sharp" size={size} color={color} style={style} />;
    case 'arrow-right':
      return <Ionicons name="arrow-forward" size={size} color={color} style={style} />;
    case 'chevron-down':
      return <Ionicons name="chevron-down" size={size} color={color} style={style} />;
    case 'calendar':
      return <MaterialCommunityIcons name="calendar-month-outline" size={size} color={color} style={style} />;
    case 'hospital':
      return <MaterialCommunityIcons name="hospital-building" size={size} color={color} style={style} />;
    case 'security':
      return <MaterialCommunityIcons name="shield-lock-outline" size={size} color={color} style={style} />;
    case 'edit':
      return <MaterialCommunityIcons name="square-edit-outline" size={size} color={color} style={style} />;
    case 'trash':
      return <MaterialCommunityIcons name="delete-outline" size={size} color={color} style={style} />;
    case 'logout':
      return <MaterialCommunityIcons name="logout" size={size} color={color} style={style} />;
    case 'eye':
      return <Ionicons name="eye-outline" size={size} color={color} style={style} />;
    case 'eye-off':
      return <Ionicons name="eye-off-outline" size={size} color={color} style={style} />;
    case 'refresh':
      return <MaterialCommunityIcons name="refresh" size={size} color={color} style={style} />;
    case 'info':
      return <MaterialIcons name="info-outline" size={size} color={color} style={style} />;
    case 'search':
      return <Ionicons name="search" size={size} color={color} style={style} />;
    case 'document':
      return <MaterialCommunityIcons name="file-document-outline" size={size} color={color} style={style} />;
    case 'wallet':
      return <Entypo name="wallet" size={size} color={color} style={style} />;
    case 'wallet-outline':
      return <Ionicons name="wallet-outline" size={size} color={color} style={style} />;
    case 'heart':
      return <Ionicons name="heart" size={size} color={color} style={style} />;
    case 'home':
      return <Ionicons name="home" size={size} color={color} style={style} />;
    case 'bell':
      return <Ionicons name="notifications-outline" size={size} color={color} style={style} />;
    case 'apple':
    case 'food-apple':
      return <MaterialCommunityIcons name="food-apple" size={size} color={color} style={style} />;
    case 'food-apple-outline':
      return <MaterialCommunityIcons name="food-apple-outline" size={size} color={color} style={style} />;
    case 'usergroup-add':
      return <AntDesign name="addusergroup" size={size} color={color} style={style} />;
    case 'chevron-right':
      return <Ionicons name="chevron-forward" size={size} color={color} style={style} />;
    case 'care':
      return <MaterialCommunityIcons name="heart-pulse" size={size} color={color} style={style} />;
    case 'qrcode':
      return <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} style={style} />;
    case 'bullhorn':
      return <MaterialCommunityIcons name="bullhorn-outline" size={size} color={color} style={style} />;
    case 'history':
      return <MaterialCommunityIcons name="history" size={size} color={color} style={style} />;
    case 'location':
      return <Ionicons name="location-outline" size={size} color={color} style={style} />;
    case 'card':
      return <Ionicons name="card-outline" size={size} color={color} style={style} />;
    case 'clock':
      return <Ionicons name="time-outline" size={size} color={color} style={style} />;
    case 'sun':
    case 'weather-sunny':
      return <MaterialCommunityIcons name="weather-sunny" size={size} color={color} style={style} />;
    case 'weather-sunset':
      return <MaterialCommunityIcons name="weather-sunset-up" size={size} color={color} style={style} />;
    case 'weather-night':
    case 'moon':
      return <MaterialCommunityIcons name="weather-night" size={size} color={color} style={style} />;
    case 'star':
      return <Ionicons name="star" size={size} color={color} style={style} />;
    case 'alert-circle':
      return <Ionicons name="alert-circle" size={size} color={color} style={style} />;
    case 'flask':
      return <MaterialCommunityIcons name="flask-outline" size={size} color={color} style={style} />;
    case 'pill':
      return <MaterialCommunityIcons name="pill" size={size} color={color} style={style} />;
    case 'chevron-up':
      return <Ionicons name="chevron-up" size={size} color={color} style={style} />;
    case 'mail':
    case 'email':
      return <Ionicons name="mail-outline" size={size} color={color} style={style} />;
    case 'medkit':
      return <Ionicons name="medkit-outline" size={size} color={color} style={style} />;
    case 'pulse':
      return <Ionicons name="pulse" size={size} color={color} style={style} />;
    case 'sparkles':
    case 'sparkles-ai':
      return <Ionicons name="sparkles-sharp" size={size} color={color} style={style} />;
    case 'robot':
    case 'ai':
      return <MaterialCommunityIcons name="robot-outline" size={size} color={color} style={style} />;
    case 'camera':
      return <Ionicons name="camera" size={size} color={color} style={style} />;
    case 'image':
      return <Ionicons name="image" size={size} color={color} style={style} />;
    case 'gift':
      return <MaterialCommunityIcons name="gift-outline" size={size} color={color} style={style} />;
    case 'plus':
      return <Ionicons name="add" size={size} color={color} style={style} />;
    case 'minus':
      return <Ionicons name="remove" size={size} color={color} style={style} />;
    default:
      return <Ionicons name="ellipse" size={size} color={color} style={style} />;
  }
};

export default AppIcon;
