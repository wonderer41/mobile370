import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import { useGlobalContext } from '../context/GlobalProvider';
import { createUser } from "../lib/database";

interface SignUpForm {
    username: string;
    email: string;
    password: string;
}

const SignUp = () => {
    const { setUser, setIsLogged } = useGlobalContext();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [form, setForm] = useState<SignUpForm>({
        username: "",
        email: "",
        password: "",
    });

    const submit = async () => {
        if (form.username === "" || form.email === "" || form.password === "") {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            // Use username as fullName for now to keep it simple
            const result = await createUser(form.email, form.password, form.username, form.username);
            
            // Check if email confirmation is needed
            if ((result as any)?.needsEmailConfirmation) {
                Alert.alert(
                    "Check Your Email", 
                    `We've sent a confirmation link to ${form.email}. Please check your email and click the confirmation link to complete your account setup. After confirming, you can sign in normally.`,
                    [
                        { 
                            text: "Go to Sign In", 
                            onPress: () => router.replace("/(auth)/sign-in") 
                        }
                    ]
                );
                return;
            }

            // If we get here, email confirmation is disabled and profile was created
            setUser(result);
            setIsLogged(true);
            Alert.alert("Success", "Account created successfully!");
            router.replace("/(tabs)/home");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="bg-primary h-full">
            <ScrollView>
                <View className="w-full justify-center min-h-[80vh] px-4 my-6">
                    <Image source={images.logo} 
                    resizeMode="contain"
                    className="w-[115px] h-[35px]" 
                    />

                    <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">
                    Sign up to Aora
                    </Text>
                    <FormField 
                    title='Email'
                    value={form.email}
                    handleChangeText={(e: string) => setForm({ ...form, email: e})}
                    otherStyles='mt-7'
                    keyboardType='email-address'
                    />
                    <FormField 
                    title='Username'
                    value={form.username}
                    handleChangeText={(e: string) => setForm({ ...form, username: e})}
                    otherStyles='mt-7'
                    />

                    <FormField 
                    title='Password'
                    value={form.password}
                    handleChangeText={(e: string) => setForm({ ...form, password: e})}
                    otherStyles='mt-7'
                    />

                    <CustomButton
                    title="Sign In"
                    handlePress={submit}
                    containerStyles="mt-7 bg-accent"
                    isLoading={isSubmitting}
                    />
                    <View className="justify-center pt-5 flex-row gap-2">
                        <Text className="text-lg text-zinc-300 font-pregular">Have an account already?
                        </Text>
                        <Link href="/(auth)/sign-in" className="text-lg font-psemibold text-accent">Sign In</Link>
                    </View>
                </View>

            </ScrollView>
            
        </SafeAreaView>
    );
};

export default SignUp;