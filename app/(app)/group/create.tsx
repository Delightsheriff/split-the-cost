// import { GroupForm, groupSchema } from "@/src/types/schema";
// import { zodResolver } from "@hookform/resolvers/zod";
// import React, { useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const CreateGroup = () => {
//   // TODO: Replace with actual auth store email
//   const authenticatedUserEmail = "alice@example.com";

//   const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
//   const [currentEmail, setCurrentEmail] = useState("");

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<GroupForm>({
//     resolver: zodResolver(groupSchema),
//   });

//   const handleAddEmail = () => {
//     const trimmed = currentEmail.trim().toLowerCase();

//     // Basic email validation
//     if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

//     // Prevent duplicates
//     if (
//       trimmed === authenticatedUserEmail ||
//       additionalEmails.includes(trimmed)
//     ) {
//       setCurrentEmail("");
//       return;
//     }

//     setAdditionalEmails([...additionalEmails, trimmed]);
//     setCurrentEmail("");
//   };

//   const handleRemoveEmail = (index: number) => {
//     setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
//   };

//   const onSubmit = (data: GroupForm) => {
//     const allMembers = [authenticatedUserEmail, ...additionalEmails];
//     console.log({ ...data, members: allMembers });
//     // TODO: Submit to API
//   };
//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={{ flex: 1 }}
//       keyboardVerticalOffset={0}
//     >
//       <ScrollView
//         className="flex-1 bg-background-dark"
//         contentContainerStyle={{ flexGrow: 1 }}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="flex-1 px-6">
//           <View className="mt-10">
//             {/* Group Name */}
//             <View className="mb-4">
//               <Text className="text-white text-lg font-medium leading-normal font-manrope mb-4">
//                 Group Name
//               </Text>
//               <Controller
//                 control={control}
//                 name="name"
//                 render={({ field: { onChange, onBlur, value } }) => (
//                   <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4">
//                     <TextInput
//                       className="flex-1 text-white h-14 text-base font-manrope"
//                       placeholder="E.g., Weekend Trip"
//                       placeholderTextColor="#9db9a6"
//                       keyboardType="default"
//                       autoCapitalize="none"
//                       autoComplete="off"
//                       returnKeyType="next"
//                       onBlur={onBlur}
//                       onChangeText={onChange}
//                       value={value}
//                     />
//                   </View>
//                 )}
//               />
//               {errors.name && (
//                 <Text className="text-red-500 text-sm mt-1 ml-1">
//                   {errors.name.message}
//                 </Text>
//               )}
//             </View>

//             {/* Members */}
//             <View className="mb-4">
//               <Text className="text-white text-xl font-bold leading-tight tracking-[-0.015em] font-manropeBold mb-4">
//                 Members
//               </Text>

//               {/* Authenticated user email (non-deletable) */}
//               <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4 h-14 mb-3">
//                 <Text className="flex-1 text-white text-base font-manrope">
//                   {authenticatedUserEmail}
//                 </Text>
//               </View>

//               {/* Additional emails with delete button */}
//               {additionalEmails.map((email, index) => (
//                 <View
//                   key={index}
//                   className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4 h-14 mb-3"
//                 >
//                   <Text className="flex-1 text-white text-base font-manrope">
//                     {email}
//                   </Text>
//                   <TouchableOpacity
//                     onPress={() => handleRemoveEmail(index)}
//                     hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                   >
//                     <Text className="text-gray-400 text-xl font-bold">×</Text>
//                   </TouchableOpacity>
//                 </View>
//               ))}

//               {/* Email input */}
//               <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4 mb-3">
//                 <TextInput
//                   className="flex-1 text-white h-14 text-base font-manrope"
//                   placeholder="Enter email address"
//                   placeholderTextColor="#9db9a6"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   autoComplete="email"
//                   returnKeyType="done"
//                   value={currentEmail}
//                   onChangeText={setCurrentEmail}
//                   onSubmitEditing={handleAddEmail}
//                 />
//                 {currentEmail.length > 0 && (
//                   <TouchableOpacity
//                     onPress={() => setCurrentEmail("")}
//                     hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//                   >
//                     <Text className="text-gray-400 text-xl font-bold">×</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>

//               {/* Add Member button */}
//               <TouchableOpacity
//                 onPress={handleAddEmail}
//                 className="
//   w-full
//   rounded-xl
//   bg-surface-dark
//   border-[2px]
//   border-dashed
//   border-white/10
//   py-4
//   items-center
// "
//               >
//                 <Text className="text-primary text-lg font-semibold font-manrope">
//                   + Add Member
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//       {/* Fixed bottom button */}
//       <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-[#0d1a0f] ">
//         <TouchableOpacity
//           onPress={handleSubmit(onSubmit)}
//           className="w-full rounded-full bg-primary py-4 items-center"
//           activeOpacity={0.8}
//         >
//           <Text className="text-white text-lg font-bold font-manropeBold">
//             Create Group
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// export default CreateGroup;

import { GroupForm, groupSchema } from "@/src/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CreateGroup = () => {
  // TODO: Replace with actual auth store email
  const authenticatedUserEmail = "alice@example.com";
  const [currentEmail, setCurrentEmail] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      members: [authenticatedUserEmail],
    },
  });

  const members = watch("members");
  const additionalEmails = members.slice(1);

  const handleAddEmail = () => {
    const trimmed = currentEmail.trim().toLowerCase();

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

    if (members.includes(trimmed)) {
      setCurrentEmail("");
      return;
    }

    setValue("members", [...members, trimmed], { shouldValidate: true });
    setCurrentEmail("");
  };

  const handleRemoveEmail = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index + 1);
    setValue("members", newMembers, { shouldValidate: true });
  };

  const onSubmit = (data: GroupForm) => {
    console.log(data);
    // TODO: Submit to API
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        className="flex-1 bg-background-dark"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6">
          <View className="mt-10">
            {/* Group Name */}
            <View className="mb-4">
              <Text className="text-white text-lg font-medium leading-normal font-manrope mb-4">
                Group Name
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4">
                    <TextInput
                      className="flex-1 text-white h-14 text-base font-manrope"
                      placeholder="E.g., Weekend Trip"
                      placeholderTextColor="#9db9a6"
                      keyboardType="default"
                      autoCapitalize="none"
                      autoComplete="off"
                      returnKeyType="next"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.name.message}
                </Text>
              )}
            </View>

            {/* Members */}
            <View className="mb-4">
              <Text className="text-white text-xl font-bold leading-tight tracking-[-0.015em] font-manropeBold mb-4">
                Members
              </Text>

              {/* Authenticated user email (non-deletable) */}
              <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4 h-14 mb-3">
                <Text className="flex-1 text-white text-base font-manrope">
                  {authenticatedUserEmail}
                </Text>
              </View>

              {/* Additional emails with delete button */}
              {additionalEmails.map((email, index) => (
                <View
                  key={index}
                  className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4 h-14 mb-3"
                >
                  <Text className="flex-1 text-white text-base font-manrope">
                    {email}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveEmail(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-gray-400 text-xl font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Email input */}
              <View className="flex-row items-center w-full rounded-xl bg-[#1c271f] border border-gray-700 px-4 mb-3">
                <TextInput
                  className="flex-1 text-white h-14 text-base font-manrope"
                  placeholder="Enter email address"
                  placeholderTextColor="#9db9a6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="done"
                  value={currentEmail}
                  onChangeText={setCurrentEmail}
                  onSubmitEditing={handleAddEmail}
                />
                {currentEmail.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setCurrentEmail("")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-gray-400 text-xl font-bold">×</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Add Member button */}
              <TouchableOpacity
                onPress={handleAddEmail}
                className="w-full rounded-xl bg-surface-dark border-[2px] border-dashed border-white/10 py-4 items-center"
              >
                <Text className="text-primary text-lg font-semibold font-manrope">
                  + Add Member
                </Text>
              </TouchableOpacity>

              {/* Members validation error */}
              {errors.members && (
                <Text className="text-red-500 text-sm mt-2 ml-1">
                  {errors.members.message}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-[#0d1a0f]">
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="w-full rounded-full bg-primary py-4 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-bold font-manropeBold">
            Create Group
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateGroup;
