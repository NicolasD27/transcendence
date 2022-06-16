import React, { useState, Fragment, Dispatch, SetStateAction, useEffect } from "react";
import axios from "axios";
import './OngoingMatch.css';
import { useNavigate } from "react-router-dom";

interface propsMatchs {
    idMatch: number,
    pseudo1: string,
    pseudo1Avatar: string,
    pseudo2: string
    pseudo2Avatar: string,
    score1: number,
    score2: number
}

const OngoingMatch = () => {
    const [matchs, setMatchs] = useState<propsMatchs[]>([])
    const navigate = useNavigate()
	const defaultAvatar = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';

    useEffect(() => {
        setMatchs([])
        axios
            .get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/matchs/active?limit=0&offset=0`, { withCredentials: true })
            .then(res => {
                console.log('DATA: ', res.data)
                res.data.map((match) => {
                    let match_tmp: propsMatchs
                    let pseudo1_avatar = defaultAvatar
                    let pseudo2_avatar = defaultAvatar

                    if (match.user1.avatarId != null)
                        pseudo1_avatar = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${match.user1.avatarId}`
                    if (match.user2.avatarId != null)
                        pseudo2_avatar = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${match.user2.avatarId}`

                    match_tmp = {idMatch: match.id, pseudo1: match.user1.pseudo, pseudo1Avatar: pseudo1_avatar, pseudo2: match.user2.pseudo, pseudo2Avatar: pseudo2_avatar, score1: match.score1, score2: match.score2 }
                    console.log("match_tmp:", match_tmp)
                    setMatchs(matchs => [...matchs, match_tmp])
                })
            })
            .catch((err) => console.log( err))
    }, [])

    const goToMatch = (id: number) => {
        navigate("mainpage?id=" + id)
    }

	return (
        <div className='usersList'>
        {
            matchs.map((match) => {
                return (
                    <div className='user' key={match.idMatch} onClick={() => goToMatch(match.idMatch)}>
                        <div id='user1'>
                            <img src={match.pseudo1Avatar} className="user1Avatar" alt="Avatar"/>
                            {match.pseudo1}
                        </div>
                        {match.score1}
                        <> - </>
                        {match.score2}
                        <div id='user2'>
                            {match.pseudo2}
                            <img src={match.pseudo2Avatar} className="user2Avatar" alt="Avatar"/>
                        </div>
                    </div>
                )
            })
        }
        </div>
	);
};

export default OngoingMatch;