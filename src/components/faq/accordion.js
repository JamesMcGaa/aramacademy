import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Accordion, Container } from '@material-ui/core';
import { AccordionSummary } from '@material-ui/core';
import { AccordionDetails } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles((theme) => ({
  accordionRoot: {
    marginBottom: '5px',
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },

  heading: {
    fontSize: theme.typography.pxToRem(18),
    textAlign: 'start',
  },

  typographyRoot: {
    fontSize: theme.typography.pxToRem(14),
    textAlign: 'start',
  },

  answerWithLink: {
    paddingLeft: '4px',
    paddingRight: '5px',
  },
}));

export default function SimpleAccordion() {
  const classes = useStyles();

  var faqElements = [
    {
      question: 'Q: Do you have a Discord Server?',
      answer: (
        <Container className={classes.answerWithLink}>
          A: Yes,
          <Link
            underline="none"
            colr="initial"
            href="https://discord.gg/MydvqhqWmM"
          >
            {' https://discord.gg/MydvqhqWmM'}
          </Link>
        </Container>
      ),
    },
    {
      question: 'Q: How long does it take to aggregate data?',
      answer:
        'A: ARAM Academy can take up to 5 minutes to process summoners, depending on length of match history.',
    },
    {
      question: 'Q: Where does ARAM Academy acquire match data?',
      answer: 'A: ARAM Academy uses the Riot API to analyze player data.',
    },
    {
      question: 'Q: Where does ARAM Academy acquire MMR and Leaderboard data?',
      answer: (
        <Container className={classes.answerWithLink}>
          A: ARAM Academy uses the WhatIsMyMMR API found here:
          <Link
            underline="none"
            colr="initial"
            href="https://dev.whatismymmr.com/"
          >
            {' https://dev.whatismymmr.com/'}
          </Link>
        </Container>
      ),
    },
    {
      question: 'Q: Is ARAM Academy affiliated with Riot?',
      answer:
        'A: No.  ARAM Academy isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.',
    },
    {
      question: 'Q: What tech does ARAM Academy use?',
      answer:
        'A: Node / Express powers our backend. Our Frontend uses React with Material-UI for component styling. Our data processing is done using the Kayn library for async performance. ARAM Academy is hosted on AWS.',
    },
  ];

  return (
    <Container>
      {faqElements.map(function (element) {
        return (
          <Accordion
            classes={{ root: classes.accordionRoot }}
            key={element.question}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Container className={classes.heading}>
                {element.question}
              </Container>
            </AccordionSummary>

            <Divider variant="middle" />

            <AccordionDetails>
              <Container classes={{ root: classes.typographyRoot }}>
                {element.answer}
              </Container>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Container>
  );
}
