import React from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';

export default class Navigation extends React.Component {
  render() {
    return (
      <Navbar bg="primary" expand="lg" variant="dark" fixed="top">
        <Navbar.Brand href="/">ARAM Academy</Navbar.Brand>
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
            <Nav.Link href="/champions">Champions</Nav.Link>
            <Nav.Link href="/tierlist">Tier List</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
            <Nav.Link href="/FAQ">FAQ</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
