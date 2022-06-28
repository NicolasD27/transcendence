import React, { useState, useEffect, Dispatch, SetStateAction} from 'react';
import axios from 'axios';
import UserList from './UserList';
import SearchBarAddGroup from './SearchBarAddGroup'
import './ChatSectionUsers.css'
import { chatStateFormat } from '../App'
import { FriendsFormat } from '../App'
import OngoingMatch from '../components/OngoingMatch'
import { useNavigate } from "react-router-dom";

interface PropsSectionUsers {
	socket : any;
	idMe : number;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
	friends : FriendsFormat[];
	friendRequestsSent : number[];
	setFriendRequestsSent : Dispatch<SetStateAction<number[]>>;
	friendRequestsReceived : FriendsFormat[];
	setFriendRequestsReceived :  Dispatch<SetStateAction<FriendsFormat[]>>;
}

export interface  PropsStateUsers {
	id : number;
	username : string;
	pseudo : string;
	avatarId : string;
	status : number;
}


export interface PropsStateChannel {
	id : number;
	isProtected : boolean;
	name : string;
	description : string;
}

export interface PropsMatchs {
    idMatch: number,
    pseudo1: string,
    pseudo1Avatar: string,
    pseudo2: string
    pseudo2Avatar: string,
    score1: number,
    score2: number
}

const ChatSectionUsers : React.FC<PropsSectionUsers> = (props) => {
	const [ searchUsers, setSearchUsers ] = useState<PropsStateUsers[]>([])
	const [ joinedChannels, setJoinedChannels ] = useState<PropsStateChannel[]>([])
	const [ joiningChannel, setJoiningChannel ] = useState(false)
	const [ existingChannels, setExistingChannels ] = useState<PropsStateChannel[]>([])
	const [ searchValue, setSearchValue ] = useState("")
	const [ createChannelButtonState, setCreateChannelButtonState ] = useState(false)
	const [ chatGamesState, setChatGameState ] = useState(true)
	const [ printSearchBar, setPrintSearchBar ] = useState(true)
    const [matchs, setMatchs] = useState<PropsMatchs[]>([])
	const defaultAvatar = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';
	const navigate = useNavigate()

	useEffect(() => {
		if (searchValue !== "")
		{
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users?search=${searchValue}`, {withCredentials: true})
				.then ((response) => setSearchUsers(response.data))
				.catch((error) => console.log(error))
		}
	}, [searchValue])

	useEffect(() => {
		axios
			.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me/channels`, {withCredentials: true})
			.then((response) => setJoinedChannels(response.data))
			.catch((error) => console.log(error))
	}, [joiningChannel])

	useEffect(() => {
		axios
			.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels?search=${searchValue}` , { withCredentials: true })
			.then (res => {
				let channel = res.data;
				setExistingChannels(channel)
			})
			.catch (err =>
				console.log(err)
			)
	}, [searchValue])

	useEffect(() => {
        axios
            .get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/matchs/active?limit=0&offset=0`, { withCredentials: true })
            .then(res => {
				setMatchs([])
                console.log('DATA: ', res.data)
                res.data.forEach((match) => {
					if (match.status === 2)
					{
						let match_tmp: PropsMatchs
						let pseudo1_avatar = defaultAvatar
						let pseudo2_avatar = defaultAvatar

						if (match.user1.avatarId != null)
							pseudo1_avatar = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${match.user1.avatarId}`
						if (match.user2.avatarId != null)
							pseudo2_avatar = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${match.user2.avatarId}`

						match_tmp = {idMatch: match.id, pseudo1: match.user1.pseudo, pseudo1Avatar: pseudo1_avatar, pseudo2: match.user2.pseudo, pseudo2Avatar: pseudo2_avatar, score1: match.score1, score2: match.score2 }
						console.log("match_tmp:", match_tmp)
						setMatchs(matchs => [...matchs, match_tmp])
					}
                })
            })
            .catch((err) => console.log( err))
    }, [chatGamesState])

	const goToMatch = (id: number) => {
        navigate("/mainpage?id=" + id)
		window.location.reload()
    }

	return (
		<div className='chatArea'>
			{
				printSearchBar &&
					<div className='switchMode'>
						<button onClick={() => setChatGameState(true)} className="switchButton">Chat</button>
						<span></span>
						<button onClick={() => setChatGameState(false)} className="switchButton">Ongoing Match</button>
					</div>
			}
			{
			 	chatGamesState &&
				<>
					<SearchBarAddGroup idMe={props.idMe} setSearchValue={setSearchValue} friends={props.friends} createChannelButtonState={createChannelButtonState} setCreateChannelButtonState={setCreateChannelButtonState} chatParamsState={props.chatParamsState} setChatParamsState={props.setChatParamsState} printSearchBar={printSearchBar} setPrintSearchBar={setPrintSearchBar}/>
					{
						!createChannelButtonState &&
						<UserList
							socket = {props.socket}
							idMe={props.idMe}
							existingChannels={existingChannels}
							joinedChannels={joinedChannels}
							setJoiningChannel={setJoiningChannel}
							searchUsers={searchUsers}
							friends={props.friends}
							friendRequestsSent={props.friendRequestsSent}
							setFriendRequestsSent={props.setFriendRequestsSent}
							friendRequestsReceived={props.friendRequestsReceived}
							setFriendRequestsReceived={props.setFriendRequestsReceived}
							searchValue={searchValue}
							setSearchValue={setSearchValue}
							setChatParamsState={props.setChatParamsState}
							chatParamsState={props.chatParamsState}
							setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked}
							matchs={matchs}
							goToMatch={goToMatch}
						/>
					}
				</>
			}
			{
				!chatGamesState &&
				<OngoingMatch matchs={matchs} goToMatch={goToMatch}/>
			}
		</div>
	)
}

export default ChatSectionUsers;