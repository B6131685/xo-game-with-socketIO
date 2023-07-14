type StateRoomType = "pending" | "awaiting" 

type TRangeSteps = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
interface IPlayer{
  user:string,
  socketID:string,
  mark: "x" | "o",
  steps: number[],
  state: "ready" | "awaiting" | "playing" | "end",
  score: number,
}
interface IlistRoom{
    id:string,
    state: StateRoomType
    player: IPlayer[]
    totalStep: number
  }

export { IlistRoom, IPlayer, TRangeSteps }