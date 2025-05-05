import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

declare global {
  interface Window {
    cordova: any;
  }
}

interface PhotoLibraryItem {
  photoURL: string;
  [key: string]: any;
}

const ImageInput = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>("Unknown");
  const [isNative, setIsNative] = useState<boolean>(false);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentPlatform = Capacitor.getPlatform();
    setPlatform(currentPlatform);
    setIsNative(Capacitor.isNativePlatform());

    document.addEventListener("deviceready", requestAuthorization, false);
  }, []);

  const requestAuthorization = () => {
    const photoLibrary = window.cordova?.plugins?.photoLibrary;

    if (!photoLibrary) {
      setError("Плагин PhotoLibrary не доступен.");
      return;
    }

    photoLibrary.requestAuthorization(
      { read: true, write: false },
      () => {
        setAuthorized(true);
      },
      (authError: any) => {
        setError("Авторизация не получена: " + JSON.stringify(authError));
      }
    );
  };

  const pickImageFromGallery = async () => {
    const photoLibrary = window.cordova?.plugins?.photoLibrary;

    if (!photoLibrary) {
      setError("Плагин PhotoLibrary не доступен.");
      return;
    }

    photoLibrary.getLibrary(
      (library: PhotoLibraryItem[]) => {
        if (library.length > 0) {
          const firstPhoto = library[0];
          setSelectedImage(firstPhoto.photoURL);
          console.log("Выбрано изображение:", firstPhoto.photoURL);
        } else {
          setError("Нет доступных изображений.");
        }
      },
      (err: any) => {
        setError("Ошибка при получении библиотеки: " + JSON.stringify(err));
      },
      {
        thumbnailWidth: 512,
        thumbnailHeight: 384,
        quality: 0.8,
        itemsInChunk: 50,
      }
    );
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Платформа:</strong> {platform}
        </p>
        <p>
          <strong>isNativePlatform():</strong>{" "}
          {isNative ? "Да (native)" : "Нет (web)"}
        </p>
        <p>
          <strong>Авторизация:</strong> {authorized ? "Да" : "Нет"}
        </p>
        {error && (
          <p style={{ color: "red" }}>
            <strong>Ошибка:</strong> {error}
          </p>
        )}
      </div>

      <button onClick={pickImageFromGallery} disabled={!authorized}>
        Загрузить из галереи
      </button>

      <div style={{ textAlign: "center", padding: "20px" }}>
        <p>v11 | 05.05 | PhotoLibrary</p>
      </div>

      {selectedImage && (
        <div style={{ marginTop: "20px" }}>
          <h2>Выбранное изображение</h2>
          <img
            src={selectedImage}
            alt="Selected"
            style={{ maxWidth: "100%" }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageInput;
