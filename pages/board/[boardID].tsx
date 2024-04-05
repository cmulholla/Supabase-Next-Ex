import { useRouter } from 'next/router';
import Head from 'next/head'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { Database } from '@/lib/schema'
import { useForm } from 'react-hook-form';
import { PostgrestError } from '@supabase/supabase-js';
import Column from '@/components/column';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

type BoardMember = Database['public']['Tables']['board_members']['Row']
type UserData = Database['public']['Tables']['UserData']['Row']

// This file will be used to display the board page
// This board page will include:
// - the header
// - the board ID
// - the board title
// - 4 lists: To Do, In Progress, In Review, and Done

export default function BoardPage() {
  const session = useSession()
  const supabase = useSupabaseClient<Database>()
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorText, setErrorText] = useState('')
  const router = useRouter();
  const [boardId, setBoardId] = useState<string | string[] | undefined>(router.query.boardID);

  // the board contains the board ID and the board title
  const [board, setBoard] = useState<{ id: number, name: string }>({ id: 0, name: '' })

  // the board members contain all of the board members ids for all of the boards
  const [board_members, setBoardMembers] = useState<BoardMember[]>([])

  // the board users contain all of the board members UserData for the current board
  const [board_users, setBoardUsers] = useState<UserData[]>([])

  // the UserData contains all of the user data for all of the users
  const [UserData, setUsers] = useState<Database['public']['Tables']['UserData']['Row'][]>([]);

  const user = session?.user;

  // Wait until router is ready to access query params

  useEffect(() => {
    if (router.isReady) {
      setBoardId(router.query.boardID);
      console.log('Board ID: ', router.query.boardID)
    }

    const fetchBoard = async () => {
      const { data: board, error } = await supabase
        .from('boards')
        .select('*')
        .eq('id', parseInt(boardId as string))
        .order('id', { ascending: true })
      
      if (error) console.log('error', error)
      else setBoard(board[0])
    }

    const fetchBoardMembers = async () => {

      if (user == null) {
        console.log('user is null')
        return;
      }

      const { data: board_members, error } = await supabase
        .from('board_members')
        .select('*')
        .eq('user_id', user.id)
        .order('board_id', { ascending: true })
      
      if (board_members == null) {
        console.log('board members is null')
        return;
      }

      if (error) console.log('error', error)
      else setBoardMembers(board_members);
    }

    const fetchUserData = async () => {
      const { data: users, error } = await supabase
        .from('UserData')
        .select('*')
      
      if (error) console.log('error', error)
      else setUsers(users)
    }

    const setupUsers = async () => {
      // users is already set
      if (board_users.length > 0) {
        console.log('board_users already set')
        console.log(board_users)
        return;
      }

      board_members.forEach((member) => {
        if (member.board_id === parseInt(boardId as string)) {
          const usern = UserData.find((usern) => usern.user_id === member.user_id)

          if (usern) {
            setBoardUsers((board_users) => [...board_users, usern])
          }
        }
      })
    }
  
    fetchBoard()
    fetchBoardMembers()
    fetchUserData()
    setupUsers()
  }, [supabase, session, user, router, boardId]);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh'}}>
        <Header session={session} supabase={supabase} boardName={board.name} board_members={board_users}/>
        <Head>
          
          <meta name="description" content={board.name} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Grid container direction="row" spacing={"1.5%"} alignItems="stretch" style={{ height: '100vh', padding: '1.5%'}}>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.1)', border: '1px solid rgba(0, 0, 0, 0.2)', height: '100%' }}>
              <Column boardId={parseInt(boardId as string)} columnName={'To Do'} session={session} supabase={supabase} board_members={board_users} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.1)', border: '1px solid rgba(0, 0, 0, 0.2)', height: '100%' }}>
              <Column boardId={parseInt(boardId as string)} columnName={'In Progress'} session={session} supabase={supabase} board_members={board_users} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.1)', border: '1px solid rgba(0, 0, 0, 0.2)', height: '100%' }}>
              <Column boardId={parseInt(boardId as string)} columnName={'In Review'} session={session} supabase={supabase} board_members={board_users} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.1)', border: '1px solid rgba(0, 0, 0, 0.2)', height: '100%' }}>
              <Column boardId={parseInt(boardId as string)} columnName={'Done'} session={session} supabase={supabase} board_members={board_users} />
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  )
}