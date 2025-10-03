import React from "react";
import { useTranslation } from "react-i18next";

export default function ResultDialog({ result, onCopy, onSave, onClose, resultRef }) {
    const { t } = useTranslation();

    if (!result) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
                ref={resultRef}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 w-[90%] min-h-[30%] max-w-xl text-center relative flex flex-col justify-center"
            >
                <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-300 mb-4">
                     {t("result")} {result}
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <button onClick={onCopy} className="btn">
                        {t("copyResult")}
                    </button>
                    <button onClick={onSave} className="btn">
                        {t("saveAsImage")}
                    </button>
                    <button onClick={onClose} className="btn">
                        {t("clear")}
                    </button>
                </div>
            </div>
        </div>
    );
}
