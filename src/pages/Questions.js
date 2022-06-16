import React, { useEffect, useState } from "react";
import { Box } from "@mui/system";
import { Button, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { useDispatch, useSelector } from "react-redux";
import { handleScoreChange } from "../redux/actions";

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

const Questions = () => {
  const {
    question_category,
    quiestion_difficulty,
    quiestion_type,
    amount_of_question,
    score,
  } = useSelector((state) => state);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let apiUrl = `/api.php?amount=${amount_of_question}`;

  //Om användaren har valt en kategori, svårihgetsgrad eller typ av frågor så
  //läggs det till i url så att vi hämtar det anvädaren har valt.
  if (question_category) {
    apiUrl = apiUrl.concat(`&category=${question_category}`);
  }
  if (quiestion_difficulty) {
    apiUrl = apiUrl.concat(`&difficulty=${quiestion_difficulty}`);
  }

  if (quiestion_type) {
    apiUrl = apiUrl.concat(`&type=${quiestion_type}`);
  }
  // denna rad och metoden decodeURIComponent gör så att texten i fågorna
  // skrivs ut korrekt och utan specialtecken där det ska vara mellanrum
  apiUrl += "&encode=url3986";

  const { response, loading } = useAxios({ url: apiUrl });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [options, setOptions] = useState([]);
  console.log(options);

  //Gör så att det rätta svaret hamnar på en slumpmässig plats i svarsalternativen
  // användaren har
  useEffect(() => {
    if (response?.results.length) {
      const question = response.results[questionIndex];
      let answers = [...question.incorrect_answers];
      answers.splice(
        getRandomInt(question.incorrect_answers.length),
        0,
        question.correct_answer
      );
      setOptions(answers);
    }
  }, [response, questionIndex]);

  // när datan laddar så visas en cirkel som snurrar
  if (loading) {
    return (
      <Box mt={20}>
        <CircularProgress></CircularProgress>
      </Box>
    );
  }

  const handleClickAnswer = (e) => {
    const question = response.results[questionIndex];
    if (e.target.textContent === question.correct_answer) {
      dispatch(handleScoreChange(score + 1));
    }

    if (questionIndex + 1 < response.results.length) {
      setQuestionIndex(questionIndex + 1);
    } else {
      navigate("/score");
    }
  };

  return (
    <Box>
      <Typography variant="h4">Questions {questionIndex + 1}</Typography>
      <Typography mt={5}>
        {decodeURIComponent(response.results[questionIndex].question)}
      </Typography>
      {options.map((data, id) => (
        <Box mt={2} key={id}>
          <Button onClick={handleClickAnswer} variant="contained">
            {decodeURIComponent(data)}
          </Button>
        </Box>
      ))}
      <Box mt={5}>
        Score: {score} / {response.results.length}
      </Box>
    </Box>
  );
};

export default Questions;
