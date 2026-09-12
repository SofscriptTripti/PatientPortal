import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';

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
  | 'food-apple'
  | 'person-add';

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
    case 'user':
      return <Ionicons name="person" size={size} color={color} style={style} />;
    case 'user-outline':
      return <MaterialCommunityIcons name="account-outline" size={size} color={color} style={style} />;
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
    case 'heart':
      return <Ionicons name="heart" size={size} color={color} style={style} />;
    case 'home':
      return <Ionicons name="home" size={size} color={color} style={style} />;
    case 'bell':
      return <Ionicons name="notifications-outline" size={size} color={color} style={style} />;
    case 'apple':
    case 'food-apple':
      return <MaterialCommunityIcons name="food-apple" size={size} color={color} style={style} />;
    case 'chevron-right':
      return <Ionicons name="chevron-forward" size={size} color={color} style={style} />;
    case 'care':
      return <MaterialCommunityIcons name="heart-pulse" size={size} color={color} style={style} />;
    default:
      return <Ionicons name="ellipse" size={size} color={color} style={style} />;
  }
};

export default AppIcon;
