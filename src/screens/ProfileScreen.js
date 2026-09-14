import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    View,
    Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, S } from '../styles';
import { Loading } from '../components';

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const raw = await AsyncStorage.getItem('user');

            if (raw) {
                setUser(JSON.parse(raw));
            } else {
                navigation.replace('Login');
            }
        } catch (error) {
            console.log('Profile load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: performLogout,
                },
            ]
        );
    };

    const performLogout = async () => {
        try {
            await AsyncStorage.multiRemove(['token', 'user']);

            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            Alert.alert(
                'Error',
                'Unable to logout. Please try again.'
            );
        }
    };

    if (loading) {
        return <Loading text="Loading profile..." />;
    }

    if (!user) {
        return null;
    }

    const role = user.role || 'Patient';

    return (
        <ScrollView
            style={S.screen}
            contentContainerStyle={{
                padding: 20,
                paddingBottom: 40,
            }}
        >
            {/* Profile Header */}
            <View
                style={{
                    backgroundColor: C.blue,
                    borderRadius: 20,
                    padding: 24,
                    alignItems: 'center',
                    marginBottom: 20,
                }}
            >
                <View
                    style={{
                        width: 82,
                        height: 82,
                        borderRadius: 41,
                        backgroundColor: C.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 38,
                        }}
                    >
                        👤
                    </Text>
                </View>

                <Text
                    style={{
                        color: C.white,
                        fontSize: 22,
                        fontWeight: '900',
                    }}
                >
                    {user.name || 'User'}
                </Text>

                <View
                    style={{
                        marginTop: 8,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        paddingHorizontal: 12,
                        paddingVertical: 5,
                        borderRadius: 999,
                    }}
                >
                    <Text
                        style={{
                            color: C.white,
                            fontSize: 12,
                            fontWeight: '800',
                        }}
                    >
                        {role}
                    </Text>
                </View>
            </View>

            {/* Account Information */}
            <Text style={S.sectionTitle}>
                Account Information
            </Text>

            <View
                style={{
                    backgroundColor: C.white,
                    borderWidth: 1,
                    borderColor: C.slate200,
                    borderRadius: 16,
                    marginTop: 12,
                    overflow: 'hidden',
                }}
            >
                <ProfileRow
                    label="Full Name"
                    value={user.name || 'Not available'}
                />

                <ProfileRow
                    label="Email"
                    value={user.email || 'Not available'}
                />

                <ProfileRow
                    label="Mobile Number"
                    value={
                        user.mobile_number ||
                        user.mobile ||
                        'Not available'
                    }
                />

                <ProfileRow
                    label="Role"
                    value={role}
                    last
                />
            </View>

            {/* Quick Actions */}
            <Text
                style={[
                    S.sectionTitle,
                    { marginTop: 28 },
                ]}
            >
                Quick Actions
            </Text>

            <Pressable
                onPress={() => navigation.navigate('MyAppointments')}
                style={({ pressed }) => ({
                    backgroundColor: C.white,
                    borderWidth: 1,
                    borderColor: C.slate200,
                    borderRadius: 14,
                    padding: 16,
                    marginTop: 12,
                    opacity: pressed ? 0.7 : 1,
                })}
            >
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: '800',
                        color: C.slate900,
                    }}
                >
                    📅 My Appointments
                </Text>

                <Text
                    style={{
                        color: C.slate500,
                        marginTop: 5,
                        fontSize: 13,
                    }}
                >
                    View and manage your appointments
                </Text>
            </Pressable>

            {/* Logout */}
            <Pressable
                onPress={logout}
                style={({ pressed }) => ({
                    backgroundColor: C.redBg,
                    borderWidth: 1,
                    borderColor: '#fecaca',
                    borderRadius: 14,
                    padding: 16,
                    marginTop: 24,
                    alignItems: 'center',
                    opacity: pressed ? 0.7 : 1,
                })}
            >
                <Text
                    style={{
                        color: C.red,
                        fontSize: 15,
                        fontWeight: '900',
                    }}
                >
                    🚪 Logout
                </Text>
            </Pressable>
        </ScrollView>
    );
}

function ProfileRow({ label, value, last }) {
    return (
        <View
            style={{
                padding: 16,
                borderBottomWidth: last ? 0 : 1,
                borderBottomColor: C.slate200,
            }}
        >
            <Text
                style={{
                    color: C.slate500,
                    fontSize: 12,
                    fontWeight: '700',
                    marginBottom: 5,
                }}
            >
                {label}
            </Text>

            <Text
                style={{
                    color: C.slate900,
                    fontSize: 15,
                    fontWeight: '700',
                }}
            >
                {value}
            </Text>
        </View>
    );
}