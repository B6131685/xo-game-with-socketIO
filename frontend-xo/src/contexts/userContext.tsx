import { ReactNode, createContext, useReducer } from 'react' 
import { v4 as uuidv4 } from 'uuid';
interface IAction {
    type: "createUser",
    name: string
}
interface IState {
    id: string | null,
    name: string | null
}

interface IUserContext{
    state:IState,
    createUser: ( name:string)=>void,
}

const UserContext = createContext<null | IUserContext >(null);

function nameReducer(state: IState ,action: IAction){
    switch (action.type) {
        case "createUser":
            return { id: uuidv4(), name: action.name }
        default:
            return state
    }
}

const UserProvider = ({children}: {children: ReactNode })=>{

    const [state, dispath] = useReducer( nameReducer, {name:null, id:null} )
    
    function createUser( name:string ):void{
        dispath({ type:'createUser', name })
    }


    return (
    <UserContext.Provider value={{ state, createUser }}>
        {children}
    </UserContext.Provider>
    )
}

export { UserContext };
export default UserProvider