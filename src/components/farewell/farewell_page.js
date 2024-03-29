import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import ReactDOM from 'react-dom';
import { useHistory } from 'react-router-dom';
import CloseIcon from '@material-ui/icons/Close';
import Link from '@material-ui/core/Link';

import {
    FormGroup,
    FormHelperText,
    Select,
    FilledInput,
    MenuItem,
    Container,
    Snackbar,
    Button,
    IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useCookies } from 'react-cookie';
var mobile = require('is-mobile');
import Background from '../../images/index_background_compressed.jpg';

const useStyles = makeStyles({
    discord: {
        'height': '150px',
        'width': 'auto',
    },
});

export default function Farewell() {
    const classes = useStyles();

    if (mobile()) {
        document.body.style.backgroundImage = `url(${Background})`;
        document.body.style.backgroundPosition = `top`;
        document.body.style.backgroundSize = `cover`;
    }

    const discord_uri = '/static/discord.png';
    return (
        <Container>
            <header
                className="masthead"
                style={{ marginBottom: '30vh' }}
            ></header>
            <main role="main" className="inner cover">
                <h1 className="cover-heading" style={{ marginBottom: '30px' }}> On Pause - ARAM Academy </h1>
                <p className="body" style={mobile() ? { fontSize: '16px' , textAlign: 'center'} : {maxWidth: '800px', textAlign: 'center', fontSize: '18px'}}>
For over two years ARAM Academy has been the premier source of competitive ARAM statistics. However for the foreseeable future the site will be put on pause due to resource constraints. For updates, please join us in the ARAM Academy Discord - which will remain open as one of the largest ARAM communities. It has been an absolute privilege to serve the ARAM Academy community, and we hope to see you again on the Howling Abyss.                     </p>
                <p className="body" style={mobile() ? { fontSize: '20px' , textAlign: 'center', marginBottom: '30px'} : { maxWidth: '800px', textAlign: 'center', fontSize: '22px', marginBottom: '30px'}}>
                    - The ARAM Academy Team
                </p>
                <div style={mobile() ? { width: '200px', margin: 'auto' } : {width: '300px', margin: 'auto'}}> 
                <Link href={"https://discord.gg/MydvqhqWmM"} style={{ textDecoration: 'none'}}>
                <Card>
                    <CardActionArea>
                        <CardMedia
                            component="img"
                            alt="Discord Link"
                            image={discord_uri}
                            title="Discord Link"
                        />
                    </CardActionArea>
                </Card>
                </Link>
                </div>
            </main>

        </Container>
    );
}
