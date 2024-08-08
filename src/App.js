import React, { useState, useEffect, useCallback } from 'react'
import Paper from '@mui/material/Paper'

import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler'
import {
	Scheduler,
	Appointments,
	AppointmentForm,
	AppointmentTooltip,
	ConfirmationDialog,
	DayView,
	WeekView,
	MonthView,
	ViewSwitcher,
	Toolbar,
	AllDayPanel,
} from '@devexpress/dx-react-scheduler-material-ui'
import { getEvents, addEvent, updateEvent, deleteEvent } from './services/firestoreService'

const App = () => {
	const [data, setData] = useState([])
	const [currentViewName, setCurrentViewName] = useState('Tydzień')

	useEffect(() => {
		const fetchEvents = async () => {
			const events = await getEvents()
			if (events) {
				setData(events)
			}
		}
		fetchEvents()
	}, [])

	const commitChanges = useCallback(async ({ added, changed, deleted }) => {
		if (added) {
			const event = {
				...added,
				startDate: added.allDay ? startOfDay(new Date(added.startDate)) : new Date(added.startDate),
				endDate: added.allDay ? endOfDay(new Date(added.endDate)) : new Date(added.endDate),
			}
			const id = await addEvent(event)
			if (id) {
				setData(prevData => [...prevData, { id, ...event }])
			}
		}
		if (changed) {
			for (const id in changed) {
				const event = {
					...changed[id],
				}
				const success = await updateEvent(id, event)
				if (success) {
					setData(prevData =>
						prevData.map(appointment =>
							appointment.id === id ? { ...appointment, ...event } : appointment
						)
					)
				} else {
					console.error('Error updating event:', id)
				}
			}
		}
		if (deleted !== undefined) {
			const success = await deleteEvent(deleted)
			if (success) {
				setData(prevData => prevData.filter(appointment => appointment.id !== deleted))
			}
		}
	}, [])

	return (
		<Paper>
			<Scheduler data={data} locale={'pl'} showCurrentTimeIndicator={true}>
				<ViewState
					currentDate={new Date()}
					currentViewName={currentViewName}
					onCurrentViewNameChange={setCurrentViewName}
				/>
				<EditingState onCommitChanges={commitChanges} />
				<IntegratedEditing />
				<DayView name='Dzień' />
				<WeekView name='Tydzień' />
				<MonthView name='Miesiąc' />
				<ConfirmationDialog />
				<Appointments />
				<AppointmentTooltip showOpenButton showDeleteButton />
				<Toolbar />
				<ViewSwitcher />
				<AllDayPanel messages={{ allDay: 'Cały dzień' }} />
				<AppointmentForm />
			</Scheduler>
		</Paper>
	)
}

const startOfDay = date => {
	const d = new Date(date)
	d.setHours(0, 0, 0, 0)
	return d
}

const endOfDay = date => {
	const d = new Date(date)
	d.setHours(23, 59, 59, 999)
	return d
}

export default App
