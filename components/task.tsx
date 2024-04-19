import { useRouter } from 'next/router';
import Head from 'next/head'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState } from 'react'
import { Database } from '@/lib/schema'
import { useForm } from 'react-hook-form';
import { PostgrestError } from '@supabase/supabase-js';

// This file will be used in the column component to display the tasks
// This task component will include:
// - the task title
// - the task assignee
// - a delete button to delete the task
// - the task title will be a link that will redirect to the task page and display the task details
// - the box will be draggable and droppable, and will update the task's column in the database when dropped
// - the box will scale with the length of the task title

type TaskProps = {
  task: Database['public']['Tables']['board_ticket_data']['Row'];
  session: any;
  supabase: any;
  board_members: Database['public']['Tables']['UserData']['Row'][];
};

// function to find a user by user_id
function findUserById(user_id: string, board_members: Database['public']['Tables']['UserData']['Row'][]): string {
  return board_members.find((user) => user.user_id === user_id)?.username || 'Unassigned';
}

export default function Task({ task, session, supabase, board_members }: TaskProps) {
  const router = useRouter();
  const user = session?.user

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const { data, error } = await supabase
      .from('board_ticket_data')
      .delete()
      .eq('ticket_id', task.ticket_id)
      .eq('board_id', task.board_id)
    if (error) {
      console.log('error', error)
    }
  }

  const handleDivClick = () => {
    router.push(`/board/${task.board_id}/${task.ticket_id}`);
  }

  return (
    <div onClick={handleDivClick} style={{ border: '1px solid black', padding: '10px', margin: '10px', cursor: 'pointer' }}>
      <h3>{task.title}</h3>
      <p>{findUserById(task.assignee_id, board_members)}</p>
      {session ? (
        <button onClick={handleDelete} className="p-2 bg-red-500 text-white rounded-lg">Delete</button>
      ) : (
        <></>
      )}
    </div>
  );
}