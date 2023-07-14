const X_mark = () => {
  return (
    <div className="w-20 h-20 relative p-0 m-0">
      <div className="w-20 absolute p-0 m-0 bg-green-500 h-[15px] rotate-45 top-[40%]"></div>
      <div className="w-20 absolute p-0 m-0 bg-green-500 h-[15px] rotate-[-45deg] top-[40%]" ></div>
    </div>
  );
};

export default X_mark;
