import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  RefreshCw,
  X,
  SwitchCamera,
  Sparkles,
  Cloud
} from 'lucide-react';
import { uploadImageToCloudinary } from '../../services/api';

interface CloudinaryImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  className?: string;
  disabled?: boolean;
}

export const CloudinaryImageUploader: React.FC<CloudinaryImageUploaderProps> = ({
  value,
  onChange,
  label = 'Foto del Producto',
  folder = 'pampa_catalog',
  className = '',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');

  // Native File Inputs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const directCameraInputRef = useRef<HTMLInputElement>(null);

  // Live Camera Viewfinder Modal States
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string>('');
  const [capturedBlobUrl, setCapturedBlobUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file upload to Cloudinary
  const handleProcessFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadProgress('error');
      setUploadMessage('Por favor seleccioná un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadProgress('error');
      setUploadMessage('La imagen no debe superar los 15 MB.');
      return;
    }

    setUploading(true);
    setUploadProgress('uploading');
    setUploadMessage('Subiendo foto...');

    try {
      const result = await uploadImageToCloudinary(file, folder);
      onChange(result.url);
      setUploadProgress('success');
      setUploadMessage('¡Foto cargada con éxito!');
      setTimeout(() => {
        setUploadProgress('idle');
      }, 4000);
    } catch (err: any) {
      setUploadProgress('error');
      setUploadMessage(err.message || 'Error al subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop Handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // --- Live Camera Management ---
  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    stopCamera();
    setCameraError('');
    setCapturedBlobUrl(null);
    setCapturedFile(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador o dispositivo no soporta acceso directo a la cámara.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Live camera error, opening native camera picker fallback:', err);
      setCameraError(
        'No pudimos acceder al visor en vivo de la cámara. Podés usar la cámara nativa de tu dispositivo.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleOpenLiveCamera = () => {
    if (disabled || uploading) return;
    setIsCameraModalOpen(true);
    setCameraFacingMode('environment');
    setTimeout(() => {
      startCamera('environment');
    }, 100);
  };

  const handleCloseLiveCamera = () => {
    stopCamera();
    setIsCameraModalOpen(false);
    setCapturedBlobUrl(null);
    setCapturedFile(null);
    setCameraError('');
  };

  const handleToggleFacingMode = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If user camera, mirror horizontal
      if (cameraFacingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileName = `foto_camara_${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            setCapturedBlobUrl(url);
            setCapturedFile(file);
            stopCamera();
          }
          setIsCapturing(false);
        },
        'image/jpeg',
        0.92
      );
    } else {
      setIsCapturing(false);
    }
  };

  const handleConfirmCapturedPhoto = async () => {
    if (!capturedFile) return;
    handleCloseLiveCamera();
    await handleProcessFile(capturedFile);
  };

  const handleRetakePhoto = () => {
    setCapturedBlobUrl(null);
    setCapturedFile(null);
    startCamera(cameraFacingMode);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden File Inputs */}
      {/* 1. Gallery / File System Input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleProcessFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* 2. Direct Native Device Camera Input */}
      <input
        ref={directCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleProcessFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Hidden canvas for taking live snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] uppercase tracking-wider">
          {label}
        </label>
      </div>

      {/* Main Dual-Action Buttons: Galería & Cámara */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Button 1: Elegir de la Galería */}
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={disabled || uploading}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1A17] hover:bg-[#FAF8F5] dark:hover:bg-[#28211D] border border-[#EBE6DD] dark:border-[#3D322B] text-[#2C221E] dark:text-[#F4EFEA] transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:border-[#4B5A36] dark:hover:border-[#809761] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group min-h-[50px]"
        >
          <div className="w-8 h-8 rounded-xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA]">
              Elegir de Galería
            </span>
            <span className="block text-[10px] text-[#7C6E65] dark:text-[#A39489]">
              Fotos guardadas o archivos
            </span>
          </div>
        </button>

        {/* Button 2: Tomar Foto con la Cámara */}
        <button
          type="button"
          onClick={handleOpenLiveCamera}
          disabled={disabled || uploading}
          className="p-3.5 rounded-2xl bg-[#4B5A36] hover:bg-[#3A4729] dark:bg-[#809761] dark:hover:bg-[#6b824e] text-white dark:text-[#181412] transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group min-h-[50px]"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 dark:bg-[#181412]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold">Tomar Foto con Cámara</span>
            <span className="block text-[10px] opacity-80">Abrir visor o cámara nativa</span>
          </div>
        </button>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && !disabled && galleryInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#4B5A36] dark:border-[#809761] bg-[#4B5A36]/5 dark:bg-[#809761]/10 scale-[1.01]'
            : 'border-[#DCD6CC] dark:border-[#3D322B] hover:border-[#4B5A36] dark:hover:border-[#809761] bg-[#FAF8F5]/60 dark:bg-[#1E1A17]/60'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {uploading ? (
          <div className="py-3 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#4B5A36] dark:text-[#809761]" />
            <p className="text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA]">
              Subiendo y procesando imagen...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#28211D] border border-[#EBE6DD] dark:border-[#3D322B] flex items-center justify-center text-[#4B5A36] dark:text-[#809761] shadow-2xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#2C221E] dark:text-[#F4EFEA]">
                O arrastrá una foto directamente aquí
              </p>
              <p className="text-[10px] text-[#7C6E65] dark:text-[#A39489] mt-0.5">
                Formatos JPG, PNG o WEBP
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Feedback Status Banner */}
      {uploadProgress === 'success' && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">{uploadMessage}</span>
        </div>
      )}

      {uploadProgress === 'error' && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-rose-800 dark:text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span className="font-semibold">{uploadMessage}</span>
        </div>
      )}

      {/* Current Image Preview Card */}
      {value && (
        <div className="p-3 rounded-2xl bg-white dark:bg-[#241E1B] border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#EBE6DD] dark:border-[#3D322B] bg-[#FAF8F5] dark:bg-[#181412] shrink-0">
              <img
                src={value}
                alt="Vista previa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#2C221E] dark:text-[#F4EFEA] block truncate">
                Foto seleccionada
              </span>
              <p className="text-[11px] text-[#7C6E65] dark:text-[#A39489] truncate max-w-[200px] sm:max-w-xs font-mono mt-0.5">
                {value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-[#7C6E65] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] hover:text-[#2C221E] transition-colors"
              title="Abrir imagen original"
            >
              <Eye className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="p-2 rounded-xl text-[#7C6E65] dark:text-[#A39489] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] hover:text-[#4B5A36] dark:hover:text-[#809761] transition-colors cursor-pointer"
              title="Cambiar foto de galería"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="Quitar foto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- LIVE CAMERA MODAL --- */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FAF8F5] dark:bg-[#181412] rounded-3xl border border-[#EBE6DD] dark:border-[#3D322B] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-white dark:bg-[#241E1B] border-b border-[#EBE6DD] dark:border-[#3D322B] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4B5A36]/10 dark:bg-[#809761]/20 text-[#4B5A36] dark:text-[#809761] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif-title font-bold text-sm sm:text-base text-[#2C221E] dark:text-[#F4EFEA]">
                    Tomar Foto con la Cámara
                  </h4>
                  <p className="text-[10px] text-[#7C6E65] dark:text-[#A39489]">
                    {capturedBlobUrl
                      ? 'Revisá la foto antes de guardarla'
                      : 'Enfocá el producto y presioná el botón de captura'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseLiveCamera}
                className="p-2 rounded-xl text-[#7C6E65] hover:text-[#2C221E] hover:bg-[#FAF8F5] dark:hover:bg-[#2E2622] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewfinder or Captured Preview Area */}
            <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
              {capturedBlobUrl ? (
                /* Snapshot Preview */
                <img
                  src={capturedBlobUrl}
                  alt="Captura"
                  className="w-full h-full max-h-[380px] object-contain"
                />
              ) : (
                /* Live Video Viewfinder */
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full max-h-[380px] object-cover"
                  />

                  {/* Framing Reticle Grid */}
                  <div className="absolute inset-4 border-2 border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                      <span className="w-4 h-4 border-t-2 border-l-2 border-white" />
                      <span className="w-4 h-4 border-t-2 border-r-2 border-white" />
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        Encuadre del producto
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="w-4 h-4 border-b-2 border-l-2 border-white" />
                      <span className="w-4 h-4 border-b-2 border-r-2 border-white" />
                    </div>
                  </div>

                  {/* Camera Switch Button */}
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all cursor-pointer shadow-md"
                    title="Cambiar cámara frontal / trasera"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Camera Error Message & Fallback Button */}
              {cameraError && !capturedBlobUrl && (
                <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center space-y-3 z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-white max-w-xs">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseLiveCamera();
                      directCameraInputRef.current?.click();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Usar cámara nativa del teléfono</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Controls Bar */}
            <div className="p-4 bg-white dark:bg-[#241E1B] border-t border-[#EBE6DD] dark:border-[#3D322B] flex items-center justify-between gap-3">
              {capturedBlobUrl ? (
                /* Actions after taking photo */
                <div className="flex items-center justify-between w-full gap-2">
                  <button
                    type="button"
                    onClick={handleRetakePhoto}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#FAF8F5] dark:bg-[#181412] hover:bg-[#EFECE6] dark:hover:bg-[#28211D] border border-[#EBE6DD] dark:border-[#3D322B] text-xs font-bold text-[#5C4F48] dark:text-[#A39489] transition-colors cursor-pointer min-h-[44px]"
                  >
                    Tomar otra
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCapturedPhoto}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#4B5A36] dark:bg-[#809761] hover:bg-[#3A4729] dark:hover:bg-[#6b824e] text-white dark:text-[#181412] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[44px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Usar esta foto</span>
                  </button>
                </div>
              ) : (
                /* Capture Button */
                <div className="flex items-center justify-between w-full">
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseLiveCamera();
                      directCameraInputRef.current?.click();
                    }}
                    className="text-xs font-semibold text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] cursor-pointer flex items-center gap-1"
                  >
                    <span>Cámara del sistema</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    disabled={isCapturing || Boolean(cameraError)}
                    className="w-14 h-14 rounded-full border-4 border-[#4B5A36] dark:border-[#809761] p-1 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    title="Capturar foto"
                  >
                    <div className="w-full h-full bg-[#4B5A36] dark:bg-[#809761] rounded-full" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseLiveCamera}
                    className="text-xs font-semibold text-[#7C6E65] dark:text-[#A39489] hover:text-[#2C221E] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
