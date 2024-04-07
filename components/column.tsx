import Task from '@/components/task';
import { useRouter } from 'next/router';
import Head from 'next/head'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState } from 'react'
import { Database } from '@/lib/schema'
import { useForm } from 'react-hook-form';
import { PostgrestError } from '@supabase/supabase-js';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

// This file will be used in the board page to display the columns
// This column component will include:
// - the column title
// - the column tasks, which will be displayed using the task component
//   - when a task is clicked, it will redirect to the task page and display the task details
//   - when a task is dragged and dropped, it will update the task's column in the database
// - the column add task button, which will redirect to the add task page

type ColumnProps = {
  boardId: number;
  columnName: string;
  session: any;
  supabase: any;
  board_members: Database['public']['Tables']['UserData']['Row'][];
};

export default function Column({ boardId, columnName, session, supabase, board_members }: ColumnProps) {
  
  // retrieve tasks from the database
  const [tasks, setTasks] = useState<Database['public']['Tables']['board_ticket_data']['Row'][]>([]);
    const [errorText, setErrorText] = useState('');
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const user = session?.user

    useEffect(() => {
        const fetchTasks = async () => {
            const { data: tasks, error } = await supabase
                .from('board_ticket_data')
                .select('*')
                .eq('board_id', boardId)
                .eq('status_column', columnName)
                .order('ticket_id', { ascending: true })
            
            if (error) console.log('error', error)
            else setTasks(tasks)
        }

        fetchTasks();
    }, [boardId, columnName]);
  
  
  return (
    <div>
      <Stack direction="row" spacing={1} justifyContent="space-between">
        <h6>{columnName + " "}</h6>
        {columnName === 'To Do' ? (
          <Button variant="outlined" color="primary" size="small" style={{position: 'relative', top: '-5px', visibility: user ? 'visible' : 'hidden'}}
                  onClick={() => router.push(`/board/${boardId}/add-task`)}>
            Add Task
          </Button>
        ) : (
          <Button variant="outlined" color="primary" size="small" style={{position: 'relative', top: '-5px', visibility: 'hidden'}}
                  onClick={() => router.push(`/board/${boardId}/add-task`)}>
            Add Task
          </Button>
        )}
      </Stack>
      <hr />
      <Stack spacing={2}>
        <Box sx={{ flexGrow: 1 }}>
          <Paper>
            <Grid container>
              {tasks.map(task => (
                <Grid item xs={12} key={task.ticket_id}>
                  <Task task={task} session={session} supabase={supabase} board_members={board_members} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Stack>
    </div>
  );
}