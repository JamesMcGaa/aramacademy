import React from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { isAndroid } from 'mobile-device-detect';

export default class Navigation extends React.Component {
  render() {
    return (
      <Navbar bg="primary" expand="lg" variant="dark" fixed="top">
        <Navbar.Brand href="/">
          <img src="/static/logo.png" height="30px" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <NavDropdown title="Leaderboards" id="collasible-nav-dropdown">
              <NavDropdown.Item href="/leaderboards/na">NA</NavDropdown.Item>
              <NavDropdown.Item href="/leaderboards/euw">EUW</NavDropdown.Item>
              <NavDropdown.Item href="/leaderboards/eune">
                EUNE
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="/about">About</Nav.Link>
            <Nav.Link href="/FAQ">FAQ</Nav.Link>
          </Nav>
          <Nav className="mr-sm-2">
            <div>
              <a href="https://discord.gg/MydvqhqWmM" target="_blank">
                <img
                  style={{
                    marginRight: '5px',
                    padding: '4px',
                    borderRadius: '5px',
                    backgroundColor: '#7289DA',
                  }}
                  height="32"
                  width="32"
                  src="/static/discord.svg"
                />
              </a>
              <a
                href={
                  isAndroid
                    ? 'fb://page/106500547936727'
                    : 'https://www.facebook.com/aramdotacademy'
                }
                target="_blank"
              >
                <img
                  style={{
                    marginRight: '5px',
                    padding: '4px',
                    borderRadius: '5px',
                    backgroundColor: '#1877F2',
                  }}
                  height="32"
                  width="32"
                  src="/static/facebook.svg"
                />
              </a>
              <a href="https://www.patreon.com/aramacademy" target="_blank">
                <img
                  style={{
                    marginRight: '5px',
                    padding: '4px',
                    borderRadius: '5px',
                    backgroundColor: '#F96854',
                  }}
                  height="32"
                  width="32"
                  src="/static/patreon.svg"
                />
              </a>{' '}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
