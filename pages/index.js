import React from "react";
import Axios from "axios";
import PouchDB from "pouchdb";
import produce from "immer";
import { withAuthSync } from "../utils/withAuthSync";
import Layout from "../components/Layout";

const DraftNote = ({ note, index, updateNote }) => (
  <form>
    <span className="note-status">draft</span>
    <textarea
      value={note.body}
      onChange={event => {
        const body = event.target.value;
        updateNote(index, body);
      }}
    />
  </form>
);

const getDb = () => {
  if (process.browser) {
    return new PouchDB("notes", { auto_compaction: true });
  }
};

class Index extends React.Component {
  static async getInitialProps({ token }) {
    return { token };
  }

  state = {
    draftNotes: [],
    savedNotes: []
  };

  db = getDb();

  componentDidMount() {
    this.loadDraftNotes();
    this.loadSavedNotes();
  }

  loadDraftNotes = async () => {
    const result = await this.db.allDocs({ include_docs: true });
    const draftNotes = result.rows.map(row => row.doc).reverse();
    this.setState({ draftNotes });
  };

  loadSavedNotes = async () => {
    const response = await Axios.get(
      "https://leigh-notes-api.herokuapp.com/notes",
      {
        headers: { Authorization: `Bearer: ${this.props.token}` }
      }
    );
    this.setState({ savedNotes: response.data.notes });
  };

  createNote = () => {
    const note = {
      _id: new Date().toISOString(),
      body: ""
    };

    const draftNotes = [note, ...this.state.draftNotes];
    this.setState({ draftNotes });

    this.db.put(note);
  };

  updateNote = async (index, body) => {
    this.setState(
      produce(draft => {
        draft.draftNotes[index].body = body;
      })
    );

    const noteId = this.state.draftNotes[index]._id;
    const note = await this.db.get(noteId);
    note.body = body;
    this.db.put(note);
  };

  deleteNote = async note => {
    const doc = await this.db.get(note._id);
    await this.db.remove(doc);
  };

  postNoteToApi = note => {
    const { token } = this.props;
    return Axios.post(
      "https://leigh-notes-api.herokuapp.com/notes",
      {
        note: { body: note.body }
      },
      { headers: { Authorization: `Bearer: ${token}` } }
    );
  };

  syncNotes = async () => {
    const promises = this.state.draftNotes
      .filter(note => note.body)
      .map(async note => {
        await this.postNoteToApi(note);
        await this.deleteNote(note);
      });

    await Promise.all(promises);
    this.loadDraftNotes();
    this.loadSavedNotes();
  };

  render() {
    const { token } = this.props;
    const { draftNotes, savedNotes } = this.state;

    return (
      <Layout token={token}>
        <h1>Notes!</h1>

        <div className="actions">
          <button onClick={this.createNote}>New</button>
          {draftNotes.length > 0 && (
            <button onClick={this.syncNotes}>Save Drafts</button>
          )}
        </div>

        <ul className="notes">
          {draftNotes.map((note, index) => (
            <li className="note" key={note._id}>
              <DraftNote
                note={note}
                index={index}
                updateNote={this.updateNote}
              />
            </li>
          ))}

          {savedNotes.map(note => (
            <li className="note" key={note.id}>
              <span className="note-status">
                {note.createdAt.substring(0, 10)}
              </span>
              <p>{note.body}</p>
            </li>
          ))}
        </ul>
      </Layout>
    );
  }
}

export default withAuthSync(Index);
