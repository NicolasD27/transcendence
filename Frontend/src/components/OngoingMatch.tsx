import React from "react";
import './OngoingMatch.css';
import './UserList.css'
import { PropsMatchs } from "./ChatSectionUsers";

const OngoingMatch = ({matchs, goToMatch} : {matchs : PropsMatchs[], goToMatch : Function}) => {

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