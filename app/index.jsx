import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from "expo-camera"
import AsyncStorage  from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'; // Importação do pacote de ícones

export default function Index() {
    const router = useRouter();
    const [facing, setFacing] = useState("back") // front or back
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false)
    const [qrData, setQrData] = useState("")
    const [qrList, setQrList] = useState([])

    const loadQrList = async () => {
        try {
            console.log("entriu")
            const storedQrList = await AsyncStorage.getItem('qrList');
            setQrList(storedQrList ? JSON.parse(storedQrList) : [])
        } catch (error) {
          console.error('Erro ao carregar qrList do AsyncStorage:', error);
        }
    };

    const saveQrList = async (list) => {
        try {
          await AsyncStorage.setItem('qrList', JSON.stringify(list));
        } catch (error) {
          console.error('Erro ao salvar qrList no AsyncStorage:', error);
        }
    };

    // load data when de component is mounted
    useFocusEffect(
        useCallback(() => {
            loadQrList();
        }, [])
    )

    // save data on db on qrList change
    useEffect(() => {
        saveQrList(qrList);
    }, [qrList]);

    if(!permission){
        return <View />
    }

    if(!permission.granted){
        return <View style={styles.container}>
            <Text style={styles.message}>Precisamos da sua permissão para usar a câmera</Text>
            <Button onPress={requestPermission} title="Conceder permissão" />
        </View>
    }

    function toggleCameraFacing(){
        setFacing((atual) => (atual === 'back' ? 'front' : 'back'))
    }

    const handleCamera = ({ data }) => {
        setScanned(true)
        setQrData(data)
        setQrList((prevList) => [...prevList, { url: data, timestamp: new Date().toLocaleString() }])
        Alert.alert("QR Code Scanned", `Content: ${data}`, 
            [
                { text: "OK", onPress: () => console.log("OK") }
            ]
        )
    }

    const goToHistory = () => {
        console.log(qrList);
        router.push({
            pathname: "/history",
            params: { qrList: JSON.stringify(qrList) },
        });
    };
    
    return (
        <View style={styles.container}>
            <CameraView 
                style={styles.camera} 
                facing={facing}
                barcodeScannerSettings={
                    { barcodeTypes: ['qr'] }
                }
                onBarcodeScanned={
                    scanned ? undefined : handleCamera
                }
            />
            <TouchableOpacity 
                style={styles.flipButton}
                onPress={toggleCameraFacing}
            >
                <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>
            <View style={styles.controllers}>
                { scanned && (
                    <>
                        <TouchableOpacity style={styles.button}
                            onPress={() => setScanned(false)}
                        >
                            <Text style={styles.text}>Scan again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}
                            onPress={goToHistory}
                        >
                            <Text style={styles.text}>Go to history</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
            {qrData !== '' && (
                <View style={styles.result}>
                    <View>
                        <Text>
                            Total QR Codes: {qrList.length}
                        </Text>
                    </View>
                    <Text style={styles.resultText}>{qrData}</Text>
                </View>
            )}
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#222"
    },
    text: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center"
    },
    message: {
        textAlign: "center",
        paddingBottom: 10,
        color: "#fff",
        fontSize: 24,
    },
    camera: {
        flex: 4
    },
    controllers: {
        flex: 2,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10
    },
    button: {
        paddingVertical: 8,
        backgroundColor: "#007AFF",
        borderRadius: 5,
        paddingHorizontal: 5,
        minWidth: 100,
    },
    result: {
        flex: 0.5,
        backgroundColor: "#ccc",
        alignItems: "center",
        justifyContent: "center",
    },
    resultText: {
        fontSize: 18,
    },
    flipButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 50,
        padding: 10,
    },
});