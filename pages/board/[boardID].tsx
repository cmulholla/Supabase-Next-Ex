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
  const [boardId, setBoardId] = useState<string>();

  // the board contains the board ID and the board title
  const [board, setBoard] = useState<{ id: number, name: string }>({ id: 0, name: '' })

  // the board members contain all of the board members ids for all of the boards
  const [board_members, setBoardMembers] = useState<BoardMember[]>([])

  // the board users contain all of the board members UserData for the current board
  const [board_users, setBoardUsers] = useState<UserData[]>([])

  // the UserData contains all of the user data for all of the users
  const [UserData, setUsers] = useState<UserData[]>([]);

  const user = session?.user;

  // Wait until router is ready to access query params

  useEffect(() => {

    setBoardId(window.location.href.split('/').pop());
    console.log('Board ID:', window.location.href.split('/').pop())

    const fetchBoard = async () => {

      console.log("Fetching board")

      if (boardId == null || Number.isNaN(boardId)) {
        console.log('boardId is null')
        return;
      }
      
      const { data: board, error } = await supabase
        .from('boards')
        .select('*')
        .eq('id', boardId)
        .order('id', { ascending: true })
      
      if (error) console.log('error', error)
      else if (board == null) {
        console.log('board is null')
      }
      else setBoard(board[0])
    }

    const fetchBoardMembers = () => {
      return new Promise(async (resolve, reject) => {
        if (user == null) {
          console.log('user is null while fetching board members')
          reject();
          return;
        }

        console.log("Fetching board members")

        console.log('boardId:', boardId)

        if (Number.isNaN(boardId) || boardId == null) {
          console.log('boardId is null')
          reject();
          return;
        }

        if (board_members.length > 0) {
          console.log('board_members already set')
          reject();
          return;
        }

        const { data: board_members1, error } = await supabase
          .from('board_members')
          .select('*')
          .eq('board_id', boardId)
          .order('user_id', { ascending: true })
        
        if (board_members1 == null) {
          console.log('board members is null')
          reject();
          return;
        }

        // check if board_members1 is less than board_members, and if so, don't update board_members
        if (board_members1.length < board_members.length) {
          console.log('board members1 is less than board_members')
          reject();
          return;
        }

        if (error) console.log('error', error)
        else {
          console.log('board members1:', board_members1)
          setBoardMembers(board_members1)
          resolve(board_members1)
        }
      });
    }

    const fetchUserData = () => {
      return new Promise(async (resolve, reject) => {
        console.log("Fetching user data")

        if (UserData.length > 0) {
          console.log('users already set')
          reject();
          return;
        }

        const { data: users, error } = await supabase
          .from('UserData')
          .select('*')
        
        if (error) {
          console.log('error', error)
          reject();
        }
        else {
          setUsers(users)
          resolve(users)
        }
      });
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
          // print each board member
          console.log('board member/////:', usern)

          if (usern) {
            setBoardUsers((board_users) => [...board_users, usern])
          }
        }
      })
    }


    if (router.isReady) {
      fetchBoard();
      
      // only run these function is user is not null
      if (user == null) {
        console.log('user is null')
        return;
      }

      Promise.all([fetchUserData(), fetchBoardMembers()]);
      setupUsers()
    }


  }, [supabase, session, user, router, boardId]);

  if (board == null) {
    return (
      <>
        <Header session={session} supabase={supabase} />
        <div>
          <h1>Your account has been flagged. Please return to the dashboard.</h1>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh'}}>
        <Header session={session} supabase={supabase} boardName={board.name} board_id={parseInt(boardId as string)} board_members={board_users}/>
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