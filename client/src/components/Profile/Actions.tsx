import { Link } from 'react-router-dom';
import './Actions.css';
import PeopleIcon from '@mui/icons-material/People';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import TableRowsIcon from '@mui/icons-material/TableRows';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import { Typography } from '@mui/material';
import { isMobile } from 'react-device-detect';

const SIZE : 'medium' | 'large' = isMobile ? 'medium' : 'large';

const ACTIONS : ActionProps[] = [
    {
        link: '/fast-game',
        title: 'Быстрая игра',
        icon: <PlayArrowIcon fontSize={SIZE}/>
    },
    {
        link: '/tournaments',
        title: 'Турниры',
        icon: <TableRowsIcon fontSize={SIZE}/>
    },
    {
        link: '/news',
        title: 'Новости',
        icon: <NewReleasesIcon fontSize={SIZE}/>
    },
    {
        link: '/friends',
        title: 'Друзья',
        icon: <PeopleIcon fontSize={SIZE}/>
    },
    {
        link: '/items',
        title: 'Предметы',
        icon: <CategoryIcon fontSize={SIZE}/>
    },
    {
        link: '/achievements',
        title: 'Достижения',
        icon: <MilitaryTechIcon fontSize={SIZE}/>
    },
    {
        link: '/settings',
        title: 'Настройки',
        icon: <SettingsIcon fontSize={SIZE}/>
    },
    {
        link: '/rules',
        title: 'Правила',
        icon: <QuestionMarkIcon fontSize={SIZE}/>
    }
]

export default function Actions() {
    return (
        <section id="profile-actions">
            {
                ACTIONS.map((action, index) => <Action key={index} {...action}/>)
            }
        </section>
    )
}

type ActionProps = {
    link: string;
    title: string;
    icon: JSX.Element;
}

const TEXT_VARIANT : 'h5' | 'h6' = isMobile ? 'h6' : 'h5';

function Action(props: ActionProps) {
    const {link, title, icon} = props;

    return (
        <div>
            <Link to={link} style={{textDecoration: 'none', color: 'white'}}>
                <center>
                    {icon}
                    <Typography variant={TEXT_VARIANT}>{title}</Typography>
                </center>
            </Link>
        </div>
    )
}