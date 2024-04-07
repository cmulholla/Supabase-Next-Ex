import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useEffect, useState } from 'react'
import { Database } from '@/lib/schema'
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/router';

const stringToColor = (str: string) => {
  let hash = 0;
  str.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  })
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += value.toString(16).padStart(2, '0')
  }
  return colour
}

function stringAvatar(name: string | null) {
  if (!name) name = " ";
  else if (name.length === 0) name = " ";

  const color = stringToColor(name);

  return {
    sx: {
      bgcolor: color,
      width: 27,
      height: 27,
    },
    children: `${name[0].toUpperCase()}`,
    title: name,
  };
}

function Header({ session, supabase, boardName = "", board_id = 0, board_members = [] }: { session: any, supabase: any, boardName?: string, board_id?: number, board_members?: Database['public']['Tables']['UserData']['Row'][]}) {
  const router = useRouter();
  const [username, setUsername] = useState('')

  // print board members if they exist
  if (board_members.length > 0) {
    console.log("board members2:", board_members);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session) return;

      const { data: UsersData, error } = await supabase
        .from('UserData')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (error) {
        console.log('Error: ', error.message);
      } else {
        setUsername(UsersData.username);
      }
    };

    fetchUserData();
  }, [supabase, session]);

  return (
    <Navbar bg="primary" variant="dark">
      <Navbar.Brand className="d-flex align-items-start" style={{ width: '33vw', justifyContent: 'flex-start', paddingLeft: '1.5%' }}>
        <Stack direction="row" spacing={1}>
          <a href={`/board/${board_id}`} style={{textDecoration: 'none', color: 'white'}}>{boardName}</a>
          {board_members.map((user) => (
            <Avatar {...stringAvatar(user.username)} />
          ))}
        </Stack>
      </Navbar.Brand>
      <Navbar.Brand href="/" style={{ width: '33vw', textAlign: 'center' }}><b>Scrum AI</b></Navbar.Brand>
      <Nav className="d-flex align-items-end" style={{ width: '33vw', justifyContent: 'flex-end', paddingRight: '1.5%' }}>
        {session ? (
          <>
            <Nav.Link eventKey="disabled" disabled>
              {username}
            </Nav.Link>
            <Nav.Link href="" onClick={handleLogout}>Logout</Nav.Link>
          </>
        ) : (
          <>
            <Nav.Link href="/login">Log in</Nav.Link>
            <Nav.Link href="/signup">Sign up for free!</Nav.Link>
          </>
        )}
      </Nav>
    </Navbar>
  );
}

export default Header;