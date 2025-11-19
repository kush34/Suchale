import { useContext, useState } from "react";
import { FileText, FileType, ArrowUpRight } from "lucide-react";
import { ThemeContext } from "@/Store/ThemeContext";

type FileViewerProps = {
  src: string;
  filename: string;
}
const FileViewer = ({ src, filename }: FileViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isPDF = src.match(/\.pdf$/i);
  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;
  return (
    <>
      <div
        className={`flex items-center gap-3 ${!theme && "bg-zinc-800"} dark:bg-gray-800 p-3 rounded cursor-pointer`}
        onClick={() => setIsOpen(true)}
      >
        {isPDF ? (
          <FileText className="text-red-500" size={28} />
        ) : (
          <FileType className="text-blue-500" size={28} />
        )}
        <div className="flex-1 truncate">{filename.slice(0,25) || src.split("/").pop()}</div>
        <ArrowUpRight
          size={22}
          className="text-gray-500 hover:text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            window.open(src, "_blank");
          }}
        />
      </div>

      {isOpen && isPDF && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`${theme ? "bg-white" : "bg-black"} rounded-lg shadow-xl w-[90%] h-[90%] p-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={src}
              title="PDF Preview"
              className="w-full h-full rounded"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default FileViewer;
