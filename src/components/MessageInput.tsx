import React, { useState } from 'react';
import { CORRECT_PIN } from '../constants';

interface MessageInputProps {
  onClose: () => void;
  onMessageSubmit: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onClose, onMessageSubmit }) => {
  const [isPinCorrect, setIsPinCorrect] = useState(false);
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setIsPinCorrect(true);
    } else {
      alert('Falsche PIN!');
      setPin('');
    }
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMessageSubmit(message);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {!isPinCorrect ? (
          <>
            <h2 className="text-2xl font-bold mb-4">PIN eingeben</h2>
            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                placeholder="PIN eingeben"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
                maxLength={4}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Bestätigen
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Neue Nachricht eingeben</h2>
            <form onSubmit={handleMessageSubmit}>
              <textarea
                placeholder="Nachricht eingeben"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
                rows={4}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Senden
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageInput;