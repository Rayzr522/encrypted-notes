import DBManager from './db'
import deepEqual from 'deep-equal'
import deepDiff from 'deep-diff'

class Sync {
    static getRemoteData(token) {
        return {
            "notes": {
                "b399bdef-ba1f-4a37-ac8a-9f5ff49649fe": {
                    "id": "b399bdef-ba1f-4a37-ac8a-9f5ff49649fe",
                    "title": "some other with easy password password",
                    "text": "Fe26.2**2e2f17bc804793f48475fd487794808bae0062af94e54d97c3ca931fda4d0225*0C55aDPQYiD8_mEIJfsUMw*8HKQQc7GSLb4yOIX11l1WpTU3sAWRqkyyBAempHfIS4**d78ba3f1812d33d78e13b86ec5e1a1c2372866c42b545eb25a2e8e49b6d4e105*7zq52L_j4KejZ2L4VWLrFGyL9O3CVZOecyhLbkZPqZg",
                    "locked": true,
                    "time": 1467884658961
                },
                "3260a39b-97a9-4a79-b392-81ab82f39837": {
                    "id": "3260a39b-97a9-4a79-b392-81ab82f39837",
                    "title": "Unlocked hopefully",
                    "text": "Fe26.2**2dfcd187e6eda2da91ab7348c9a6b941cc13b35fa24e947d1d64a1191bf4fcf4*pc9nIyOBYLPwmVl0lq-g6w*Kt159T-ebeGLirs_IxKvYg6T4CE5xKcJLO5j9LOEh-E**83b2ed5cd60fa8502dde7c26de6cfedda74966cfcc62e8e880f1892a5c2fde00*ei1tdsnTTP_pWp_RJkksFl9D1NoPjYW48_yR3YQj6tE",
                    "locked": true,
                    "time": 1467884658960
                }
            },
            "notesOrdering": [
                "b399bdef-ba1f-4a37-ac8a-9f5ff49649fe",
                "3260a39b-97a9-4a79-b392-81ab82f39837"
            ]
        }
    }

    static getLocalData() {
        return {
            "notes": DBManager.getAllNotes(),
            "notesOrdering": DBManager.getNotesOrdering()
        }
    }

    static sync(token) {
        const remoteData = this.getRemoteData(token)
        const localData = this.getLocalData()

        console.log(localData, remoteData)

        const equal = deepEqual(localData, remoteData, {strict: true})
        console.log(window.x=deepDiff.diff(localData, remoteData))

        if (equal) {
            return
        }
        return
        DBManager.setNotes(remoteData.notes, remoteData.notesOrdering)
    }
}

window.Sync = Sync
export default Sync