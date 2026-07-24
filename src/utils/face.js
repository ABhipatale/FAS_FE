// Face registration status for a user/employee payload.
//
// Faces live in the face_descriptors table and are surfaced on the user payload
// as face_descriptors_count. The legacy users.face_descriptor column is kept as
// a fallback for older rows, and can arrive either as an array or as a JSON
// string depending on the endpoint.
export const hasFaceRegistered = (user) => {
  if (!user) return false;

  if ((user.face_descriptors_count ?? 0) > 0) return true;

  const legacy = user.face_descriptor;
  if (Array.isArray(legacy)) return legacy.length > 0;
  if (typeof legacy === 'string') {
    const trimmed = legacy.trim();
    return trimmed !== '' && trimmed !== '[]' && trimmed !== 'null';
  }

  return false;
};

export default hasFaceRegistered;
