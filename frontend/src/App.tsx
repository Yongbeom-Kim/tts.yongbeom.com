import "./App.css";
import HeaderBar from "./component/HeaderBar/HeaderBar";
import DescriptionBar from "./component/DescriptionBar/DescriptionBar";
import FileUploadForm from "./component/FileUploadForm/FileUploadForm";


function App() {

  // TODO: Clean up textarea and classes, separate into its own component
  return (
    <div className="relative h-screen w-screen scroll-x-auto flex flex-col">
      <HeaderBar className="px-20 h-20 bg-slate-700" />
      <DescriptionBar className="px-20 py-10" />
      <FileUploadForm />
    </div>
  );
}

export default App;
