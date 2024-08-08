import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../config/firebase'

export const getEvents = async () => {
	try {
		const eventsCollection = collection(db, 'events')
		const eventsSnapshot = await getDocs(eventsCollection)

		const eventsList = eventsSnapshot.docs.map(doc => {
			const data = doc.data()

			const startDate = data.startDate ? data.startDate.toDate() : null
			const endDate = data.endDate ? data.endDate.toDate() : null

			return {
				id: doc.id,
				...data,
				startDate,
				endDate,
			}
		})

		return eventsList
	} catch (error) {
		console.error('Error fetching events:', error)
		return false
	}
}

export const addEvent = async event => {
	try {
		const eventsCollection = collection(db, 'events')
		const docRef = await addDoc(eventsCollection, event)
		return docRef.id
	} catch (error) {
		console.error('Error adding event:', error)
		return false
	}
}

export const updateEvent = async (id, event) => {
	try {
		const eventDoc = doc(db, 'events', id)
		await updateDoc(eventDoc, event)
		return true
	} catch (error) {
		console.error('Error updating event:', error)
		return false
	}
}

export const deleteEvent = async id => {
	try {
		const eventDoc = doc(db, 'events', id)
		await deleteDoc(eventDoc)
		return true
	} catch (error) {
		console.error('Error deleting event:', error)
		return false
	}
}
