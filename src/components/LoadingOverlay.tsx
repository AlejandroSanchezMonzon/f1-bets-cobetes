import { useEffect, useState } from "react";

interface LoadingOverlayProps {
  loading?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading: loadingProp,
}) => {
  const isControlled = loadingProp !== undefined;
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = isControlled ? loadingProp : internalLoading;

  useEffect(() => {
    if (!isControlled) {
      const handleToggleLoading = (event: any) => {
        setInternalLoading(event.detail);
      };

      window.addEventListener("toggleLoading", handleToggleLoading);
      return () => {
        window.removeEventListener("toggleLoading", handleToggleLoading);
      };
    }
  }, [isControlled]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <span className="loader"></span>
      <style>{`
        .loader {
          width: 48px;
          height: 48px;
          border: 3px dotted #fafafa;
          border-style: solid solid dotted dotted;
          border-radius: 50%;
          display: inline-block;
          position: relative;
          box-sizing: border-box;
          animation: rotation 2s linear infinite;
        }
        .loader::after {
          content: "";
          box-sizing: border-box;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          border: 3px dotted #294643;
          border-style: solid solid dotted;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          animation: rotationBack 1s linear infinite;
          transform-origin: center center;
        }
        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes rotationBack {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
