import React, { useState, useEffect } from "react";
import AsyncStorage  from '@react-native-async-storage/async-storage'
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Linking,
    Button,
    TouchableOpacity,
    Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function History() {
    const router = useRouter();
    const { qrList } = useLocalSearchParams();
    const [qrListArray, setQrListArray] = useState([]);
    const [darkMode, setDarkMode] = useState(false)
    useEffect(() => {
        if (qrList) {
            setQrListArray(JSON.parse(qrList));
        } else {
            setQrListArray([]);
        }
    }, [qrList]) // Executa quando qrList mudar

    const clearHistory = async () => {
        try{
            await AsyncStorage.removeItem("qrList");
            console.log("apagou")
        } catch(e){
            console.log("error during cleaning hostory", e)
        }
        setQrListArray([])
    }

    const renderItem = async ({ item, index }) => {
        const { url } = item
        const validURL = await Linking.canOpenURL(url)

        if(validURL){
            return(
                <View style={styles.listItem}>
                    <Text
                        style={[
                            styles.listText,
                            { color: "blue", textDecorationLine: "underline" },
                        ]}
                        onPress={() => Linking.openURL(url)}
                        onLongPress={() => Share.share({ message: url })}
                    >
                        {url}
                    </Text>
                </View>
            )
        }
        return (
            <View style={styles.listItem}>
              <Text style={styles.listText}>{`${index + 1}. ${item}`}</Text>
            </View>
        );
    }

    return (
        <View style={[
            styles.historyContainer,
            darkMode && { backgroundColor: "#000", color: "#fff" },
          ]}
        >
            <TouchableOpacity
                style={[styles.button,
                    {backgroundColor: darkMode?"#fff":"#000"}
                ]}
                onPress={() => setDarkMode(!darkMode)}
            >
                <Text style={{color: darkMode?"#000":"#fff"}}>
                    {darkMode?"Light Mode":"Dark Mode"}
                </Text>
            </TouchableOpacity>
            <Text style={[styles.historyTitle,
                darkMode && { color: "#fff" }
                ]}>
                    Scanned QrCodes history
            </Text>
            <FlatList
                data={qrListArray}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={<Text style={[styles.historyTitle, darkMode && {color: "#fff"}]}>No scanned QrCodes</Text>}
            />
            <Button title="Clear history" onPress={clearHistory} color="red" />
        </View>
    );
}
const styles = StyleSheet.create({
    historyContainer: {
      flex: 1,
      padding: 20,
      backgroundColor: "#fff",
    },
    historyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    listItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
    },
    listText: {
      fontSize: 16,
    },
    button: {
        paddingVertical: 8,
        borderRadius: 5,
        paddingHorizontal: 5,
        margin: "auto"
    },
  });