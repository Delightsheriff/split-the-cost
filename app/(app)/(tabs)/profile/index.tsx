import {
  Bell,
  DollarSign,
  HelpCircle,
  Info,
  Moon,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Index = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  const user = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    verified: true,
  };

  // 1. Move your list items into an array
  const settingsData = [
    {
      id: "edit",
      title: "Edit Profile",
      icon: <Users size={20} color="#3b82f6" />,
      type: "link",
    },
    {
      id: "currency",
      title: "Currency",
      value: "USD",
      icon: <DollarSign size={20} color="#10b981" />,
      type: "link",
    },
    {
      id: "notif",
      title: "Notifications",
      icon: <Bell size={20} color="#3b82f6" />,
      type: "switch",
      state: notificationsEnabled,
      setter: setNotificationsEnabled,
    },
    {
      id: "dark",
      title: "Dark Mode",
      icon: <Moon size={20} color="#8b5cf6" />,
      type: "switch",
      state: darkModeEnabled,
      setter: setDarkModeEnabled,
    },
    {
      id: "help",
      title: "Help & Support",
      icon: <HelpCircle size={20} color="#3b82f6" />,
      type: "link",
    },
    {
      id: "about",
      title: "About",
      icon: <Info size={20} color="#3b82f6" />,
      type: "link",
    },
  ];

  // 2. Component for the Header (The "Profile" title)
  const renderHeader = () => (
    <View className="px-6 py-6 border-b border-white/5 bg-background-dark">
      <Text className="text-4xl font-extrabold tracking-tight text-white font-manropeBold">
        Profile
      </Text>
    </View>
  );

  // 3. Component for the Profile Card (Top of the scrollable area)
  const renderProfileCard = () => (
    <View className="px-6 py-8 items-center">
      <View className="relative">
        <Image
          source={{ uri: user.avatar }}
          className="w-24 h-24 rounded-full border-4 border-surface-dark"
        />
        {user.verified && (
          <View className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full items-center justify-center border-2 border-background-dark">
            <Text className="text-[#0d1a0f] text-xs font-bold">✓</Text>
          </View>
        )}
      </View>
      <Text className="text-white text-2xl font-bold mt-4">{user.name}</Text>
      <Text className="text-slate-400 text-base mt-1">{user.email}</Text>
    </View>
  );

  // 4. Component for the Footer (Logout & Version)
  const renderFooter = () => (
    <View className="px-6 py-8">
      <TouchableOpacity className="rounded-xl py-4 items-center border border-red-500/20 mb-8">
        <Text className="text-red-500 text-lg font-bold">Log Out</Text>
      </TouchableOpacity>
      <Text className="text-slate-500 text-sm font-medium text-center">
        Version 1.0.0 • Build 100
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background-dark">
      {/* OPTION: Fixed Header (Stays put, doesn't scroll) */}
      {renderHeader()}

      <FlatList
        data={settingsData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderProfileCard}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View className="px-6 mb-3">
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center bg-surface-dark rounded-xl p-4 border border-white/5"
            >
              <View className="w-10 h-10 rounded-full items-center justify-center bg-white/5 mr-3">
                {item.icon}
              </View>
              <Text className="flex-1 text-white text-base">{item.title}</Text>

              {item.type === "switch" ? (
                <Switch
                  value={item.state}
                  onValueChange={item.setter}
                  trackColor={{ false: "#334155", true: "#13ec5b" }}
                />
              ) : (
                <View className="flex-row items-center">
                  {item.value && (
                    <Text className="text-slate-400 mr-2">{item.value}</Text>
                  )}
                  <Text className="text-slate-400 text-xl">›</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default Index;
