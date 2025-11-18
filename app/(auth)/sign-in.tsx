import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { images } from "../../constants";
import { useGlobalContext } from "../context/GlobalProvider";
import { getCurrentUser, signIn } from "../lib/database";

interface SignInForm {
    email: string;
    password: string;
}

const SignIn = () => {
    const { setUser, setIsLogged } = useGlobalContext();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [form, setForm] = useState<SignInForm>({
        email: "",
        password: "",
    });

    const submit = async () => {
        if (form.email === "" || form.password === "") {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setIsSubmitting(true);

        try {
            await signIn(form.email, form.password);
            let result = await getCurrentUser();
            
            // If user doesn't have a profile yet (email just confirmed), create it
            if (!result) {
                console.log('No profile found, attempting to create after email confirmation');
                const { createProfileAfterConfirmation } = await import("../lib/database");
                result = await createProfileAfterConfirmation();
            }
            
            if (!result) {
                throw new Error("Unable to load user profile. Please try signing in again.");
            }

            setUser(result);
            setIsLogged(true);
            Alert.alert("Success", "Welcome back!");
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
                        Log in to Aora
                    </Text>

                    <FormField 
                    title='Email'
                    value={form.email}
                    handleChangeText={(e: string) => setForm({ ...form, email: e})}
                    otherStyles='mt-7'
                    keyboardType='email-address'
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
                        <Text className="text-lg text-zinc-300 font-pregular">
                            Don&apos;t have an account?
                        </Text>
                        <Link href="/(auth)/sign-up" className="text-lg font-psemibold text-accent">Sign Up</Link>
                    </View>
                </View>

            </ScrollView>
            
        </SafeAreaView>
    );
};

export default SignIn;