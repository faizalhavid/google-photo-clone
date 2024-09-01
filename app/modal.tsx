import React, { useState } from 'react';
import { Button, Modal, View, Platform, StatusBar } from 'react-native';
import { supabase } from '~/utils/supabase';

export default function ModalComponent() {
  const [modalVisible, setModalVisible] = useState(true);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button title='Sign Out' onPress={handleSignOut} />
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </Modal>
  );
}