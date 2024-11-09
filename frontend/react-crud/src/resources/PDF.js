import  { Document, Page, Text, View, StyleSheet, Canvas, Svg, Rect, Line, G } from "@react-pdf/renderer";

const flexRow = {
  display: "flex",
  flexDirection: "row"
};
const flexColumn = {
  display: "flex",
  flexDirection: "column"
};

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10
  },
  headerContainer: {
    ...flexRow
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    alignSelf: "center"
  },
  matchInfoContainer: {
    ...flexRow,
    justifyContent: "space-between",
    marginBottom: 5
  },
  matchInfoColumn: {
    marginRight: 5
  },
  matchInfoColumnItem: {
    marginBottom: 3
  },
  qrCode: {
    height: 80,
    width: 80
  },
  scoreTablesContainer: {
    ...flexRow,
    justifyContent: "space-around",
    marginBottom: 9
  },
  teamsRow: {
    ...flexRow,
    marginBottom: 3
  },
  scoreTable: {
    ...flexColumn,
    border: "1px solid black",
    paddingVertical: 3
  },
  scoreTableHeader: {
    alignSelf: "center",
    marginBottom: 3
  },
  fillInBoxTeam: {
    height: "0.5cm",
    width: "1cm",
    backgroundColor: "rgb(220,220,220)",
    marginHorizontal: 3
  },
  scoreCeckBoxContainer: {
    ...flexRow,
    justifyContent: "space-around",
    fontSize: 9
  },
  scoreCeckBox: {
  },
  footerContainer: {
    ...flexRow,
    justifyContent: "space-between"
  },
  footerItem: {
    marginRight: 5
  },
  scorePlaceHolder: {
    alignSelf: "center",
    height: "0.5cm",
    width: "2cm",
    backgroundColor: "rgb(220,220,220)",
    textAlign: "center"
  },
  teamPlaceHolder: {
    flexGrow: 1,
    height: "0.5cm",
    backgroundColor: "rgb(220,220,220)",
    color: "white"
  },
});

const ScorePlaceHolder = () => (
  <View style={{ ...styles.scorePlaceHolder, ...styles.footerItem }}>
    <Text>:</Text>
  </View>
)
  
// Create Document Component
const MyDocument = () => (
  <Document>
    <Page style={styles.page} size="A5" orientation="portrait">
      <View style={styles.headerContainer}>
        <View style={{ flexGrow: 1 }}>
          <Text style={styles.title}>Turnierspielbogen</Text>
          <View style={styles.matchInfoContainer}>
            <View style={styles.matchInfoColumn}>
              <Text style={styles.matchInfoColumnItem}>Team A</Text>
              <Text style={styles.matchInfoColumnItem}>Team B</Text>
              <Text style={styles.matchInfoColumnItem}>Schiedsgericht</Text>
            </View>
            <View style={{ ...styles.matchInfoColumn, flexGrow: 1 }}>
              <Text style={styles.matchInfoColumnItem}>Platzhalter Team A</Text>
              <Text style={styles.matchInfoColumnItem}>Platzhalter Team B</Text>
              <Text style={styles.matchInfoColumnItem}>Platzhalter Schiedsgericht</Text>
            </View>
            <View style={styles.matchInfoColumn}>
              <Text style={styles.matchInfoColumnItem}>Gr</Text>
              <Text style={styles.matchInfoColumnItem}>Feld</Text>
            </View>
            <View style={{ ...styles.matchInfoColumn, flexBasis: "35em" }}>
              <Text style={styles.matchInfoColumnItem}>Gr</Text>
              <Text style={styles.matchInfoColumnItem}>Feld</Text>
            </View>
          </View>
        </View>
        <Canvas style={styles.qrCode}>
          
        </Canvas>
      </View>
      <View style={styles.scoreTablesContainer}>
        {[...Array(3)].map((_, i) => (
          <View style={styles.scoreTable}>
            <Text style={styles.scoreTableHeader}>Satz {i+1}</Text>
            <View style={styles.teamsRow}>
              <View style={styles.fillInBoxTeam}/>
              <Text>Teams</Text>
              <View style={styles.fillInBoxTeam}/>
            </View>
            {[...Array(30)].map((_, i) => (
              <View style={styles.scoreCeckBoxContainer}>
                <Text>{i+1}</Text>
                <Text></Text>
                <Text>{i+1}</Text>
              </View>
            ))}
            <Text style={styles.scoreTableHeader}>Ergebnis</Text>
            <View style={styles.scorePlaceHolder}>
              <Text>:</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.footerContainer}>
        <Text style={styles.footerItem}>Sieger</Text>
        <View style={{...styles.teamPlaceHolder, ...styles.footerItem }}/>
        <Text style={styles.footerItem}>Sätze</Text>
        {ScorePlaceHolder()}
        <Text style={styles.footerItem}>Bälle</Text>
        {ScorePlaceHolder()}
      </View>
    </Page>
  </Document>
);

export default MyDocument;