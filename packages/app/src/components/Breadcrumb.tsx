import { Image, Text, TouchableOpacity } from 'react-native';
import { ChevronLeftIcon } from '../@constants/ChevronIcons';
import { Colors } from '../utils/colors';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Breadcrumb() {
  const navigate = useNavigate();
  return (
    <TouchableOpacity
      style={{ flex: 1, alignItems: 'center', flexDirection: 'row', marginBottom: 25 }}
      onPress={() => navigate(-1)}>
      <Image source={{ uri: ChevronLeftIcon }} style={{ width: 20, height: 20, marginRight: 10 }} />
      <Text style={{ color: Colors.purple[200] }}>GoodCollective Home</Text>
      <Text style={{ color: Colors.gray[200] }}> / {'title'}</Text>
    </TouchableOpacity>
  );
}

export default Breadcrumb;
