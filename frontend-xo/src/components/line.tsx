export type CDimensionType = "row" | "col" | "left_diagonal" | "right_diagonal" |  null

const Line = ({dimension}: { dimension:CDimensionType }) => {
  if(dimension==="row")
  return <div className="absolute left-[-12px] right-[-12px] h-3 bg-neutral-300 rounded-xl"></div>

  if(dimension==="col")
  return <div className="absolute left-[-12px] right-[-12px] h-3 rotate-[90deg] bg-neutral-300 rounded-xl"></div>

  if(dimension==="left_diagonal")
  return  <div className="absolute left-[-45px] right-[-45px] h-3 rotate-[45deg] bg-neutral-300 rounded-xl"></div>

  if(dimension==='right_diagonal')
  return <div className="absolute left-[-45px] right-[-45px] h-3 rotate-[-45deg] bg-neutral-300 rounded-xl"></div>

  return null
}

export default Line