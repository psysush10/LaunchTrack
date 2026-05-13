import Lottie from "lottie-react";
import successAnimation from "../public/animations/success.json"

type SuccessModalProps = {
  isVisible: boolean;
};

export default function SuccessModal({ isVisible } : SuccessModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <div className="w-48">
          <Lottie
            animationData={successAnimation}
            loop={false}
          />
        </div>

        <h2 className="text-xl font-semibold mt-2">
          Project Created Successfully
        </h2>
      </div>
    </div>
  );
}